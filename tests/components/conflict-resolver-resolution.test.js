import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { mount } from '@vue/test-utils';
// ConfigHelpers must finish loading before store.js does, otherwise the
// store.js -> ConfigHelpers -> ConfigAccumalator -> store.js import cycle
// hands ConfigAccumalator an uninitialized `$store` binding and throws.
import '@/utils/config/ConfigHelpers';
import store from '@/store';
import ConflictResolver from '@/components/Configuration/ConflictResolver.vue';
import StoreKeys from '@/utils/StoreMutations';
import request from '@/utils/request';
import { dump as yamlDump } from '@/utils/yaml';

vi.mock('@/utils/request', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

// This suite drives the resolver against the real Vuex store (as
// tests/unit/config-save-conflict.test.js does), so store-state assertions
// exercise the same code path production runs. The merge view itself is
// mocked - its DOM/diffing behaviour is covered separately in
// tests/components/conflict-resolver-mergeview.test.js against the real
// @codemirror/merge package. Here, `b.state.doc.toString()` simply echoes
// back whatever `conflict.yours` was, since these tests care about what
// happens with the *resolved* text, not how it was produced.
vi.mock('@codemirror/merge', () => ({
  MergeView: class {
    constructor(config) {
      this._config = config;
      this.a = { state: { doc: { toString: () => config.a.doc } } };
      this.b = { state: { doc: { toString: () => config.b.doc } } };
      this.chunks = [{ fromA: 0, toA: 1 }];
    }

    destroy() {}
  },
}));

const stubs = {
  Button: { props: ['click', 'disallow'], template: '<button @click="click"><slot /></button>' },
  ConfirmDialog: { props: ['open'], template: '<div class="confirm-stub" v-if="open" />' },
};
const mocks = { $t: (k, v) => `${k}${v ? JSON.stringify(v) : ''}`, $toast: { error: vi.fn(), success: vi.fn() } };

function mountResolver() {
  return mount(ConflictResolver, { global: { plugins: [store], stubs, mocks } });
}

describe('ConflictResolver resolution flows (real store)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.commit(StoreKeys.SET_SAVE_CONFLICT, null);
    store.state.currentConfigInfo = {};
    store.state.rootConfig = null;
    store.state.rootConfigHash = null;
    store.state.configHash = 'stale-hash';
    store.state.config = { pageInfo: { title: 'Stale' }, appConfig: {}, sections: [], pages: [] };
    store.state.configSource = store.state.config;
    store.state.editMode = true;
  });

  describe('Critical 1 - "Save merged version" puts the merge into the store', () => {
    it('applies the merged content to the store on success, so a follow-up save carries it forward', async () => {
      const mergedYaml = yamlDump({
        pageInfo: { title: 'Merged Title' }, appConfig: {}, sections: [], pages: [],
      });
      const conflict = {
        yours: mergedYaml, theirs: 'pageInfo:\n  title: Theirs\nsections: []\n', theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);

      request.post.mockResolvedValue({ data: { success: true, message: 'ok', newHash: 'merged-hash' } });

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.saveMerged();
      // flush the writeConfigToDisk promise chain and the follow-up dispatch
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      await wrapper.vm.$nextTick();

      // Without the fix, state.config still holds the pre-merge "Stale" title,
      // even though disk (and configHash) now reflect the merge.
      expect(store.state.config.pageInfo.title).toBe('Merged Title');
      expect(store.state.configHash).toBe('merged-hash');

      // The critical regression: a second save built from the (now-current)
      // store must carry the merge forward, not the pre-merge stale content.
      const ctx = {
        $store: store,
        $t: (k) => k,
        showToast: vi.fn(),
        progress: { start: vi.fn(), end: vi.fn() },
        carefullyClearLocalStorage: vi.fn(),
      };
      request.post.mockClear();
      request.post.mockResolvedValue({ data: { success: true, message: 'ok', newHash: 'second-hash' } });
      const { writeConfigToDisk } = (await import('@/mixins/ConfigSaving')).default.methods;
      await writeConfigToDisk.call(ctx, store.state.config);

      const [, body] = request.post.mock.calls[0];
      expect(body.baseHash).toBe('merged-hash');
      expect(body.config).toContain('Merged Title');
      expect(body.config).not.toContain('Stale');
    });

    it('also applies the store update on "Overwrite with mine", not only "Save merged"', async () => {
      const yours = yamlDump({ pageInfo: { title: 'My Version' }, appConfig: {}, sections: [], pages: [] });
      const conflict = {
        yours, theirs: 'pageInfo:\n  title: Theirs\nsections: []\n', theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
      request.post.mockResolvedValue({ data: { success: true, message: 'ok', newHash: 'overwrite-hash' } });

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.confirmOverwrite();
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      await wrapper.vm.$nextTick();

      expect(store.state.config.pageInfo.title).toBe('My Version');
      expect(store.state.configHash).toBe('overwrite-hash');
    });

    it('does NOT touch the store when the forced write itself fails', async () => {
      const mergedYaml = yamlDump({ pageInfo: { title: 'Merged Title' }, appConfig: {}, sections: [], pages: [] });
      const conflict = {
        yours: mergedYaml, theirs: 'pageInfo:\n  title: Theirs\nsections: []\n', theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
      request.post.mockResolvedValue({ data: { success: false, message: 'disk full' } });

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.saveMerged();
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      await wrapper.vm.$nextTick();

      expect(store.state.config.pageInfo.title).toBe('Stale');
    });
  });

  describe('Critical 3 - "Discard mine, reload theirs" on the root config', () => {
    it('forces a genuine refetch instead of re-reading the stale in-memory rootConfig', async () => {
      store.state.rootConfig = { pageInfo: { title: 'Stale Root' }, appConfig: {}, sections: [], pages: [] };
      store.state.rootConfigHash = 'stale-hash';

      const freshYaml = [
        'pageInfo:',
        '  title: Fresh From Disk',
        'appConfig: {}',
        'pages: []',
        'sections: []',
        '',
      ].join('\n');
      request.get.mockResolvedValue({ data: freshYaml, headers: new Headers({ 'x-config-hash': 'fresh-hash' }) });

      const conflict = {
        yours: 'pageInfo:\n  title: Mine\nsections: []\n', theirs: freshYaml, theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.keepTheirs();
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      await wrapper.vm.$nextTick();

      // Without the fix, INITIALIZE_CONFIG skips refetching because
      // state.rootConfig is already (stale-ly) populated, and the screen
      // keeps showing "Stale Root" while claiming the reload succeeded.
      expect(store.state.rootConfig.pageInfo.title).toBe('Fresh From Disk');
      expect(store.state.config.pageInfo.title).toBe('Fresh From Disk');
      expect(store.state.configHash).toBe('fresh-hash');
      expect(request.get).toHaveBeenCalled();
    });

    it('still works correctly for sub-page configs (regression guard)', async () => {
      store.state.currentConfigInfo = { confId: 'sub-page', confPath: './sub.yml' };
      store.state.rootConfig = { pageInfo: {}, appConfig: {}, sections: [], pages: [{ name: 'Sub Page', path: './sub.yml' }] };
      store.state.rootConfigHash = 'root-hash';

      const subYaml = 'pageInfo:\n  title: Fresh Sub\nappConfig: {}\nsections: []\n';
      request.get.mockResolvedValue({ data: subYaml, headers: new Headers({ 'x-config-hash': 'fresh-sub-hash' }) });

      const conflict = {
        yours: 'pageInfo:\n  title: Mine\nsections: []\n', theirs: subYaml, theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.keepTheirs();
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      await wrapper.vm.$nextTick();

      expect(store.state.config.pageInfo.title).toBe('Fresh Sub');
      expect(store.state.configHash).toBe('fresh-sub-hash');
    });
  });

  describe('Important B regression - no optimistic hash commit on "keep theirs"', () => {
    it('does NOT commit configHash until the refetch actually resolves, so a failed ' +
      'sub-page refetch cannot leave configHash pointing at disk while state.config ' +
      'still holds the pre-conflict content (the silent-overwrite window)', async () => {
      store.state.currentConfigInfo = { confId: 'sub-page', confPath: './sub.yml' };
      store.state.rootConfig = { pageInfo: {}, appConfig: {}, sections: [], pages: [{ name: 'Sub Page', path: './sub.yml' }] };
      store.state.rootConfigHash = 'root-hash';
      store.state.configHash = 'stale-hash';
      // The sub-config GET fails and never resolves within this test, so we
      // can observe that configHash was never optimistically moved off its
      // pre-conflict value while the refetch is in flight/failed.
      request.get.mockReturnValue(new Promise(() => {}));

      const conflict = {
        yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now(),
      };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);

      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();
      wrapper.vm.keepTheirs();

      expect(store.state.configHash).toBe('stale-hash');
    });
  });

  describe('Minor - escape hatch', () => {
    it('dismisses the conflict on Escape', async () => {
      const conflict = { yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now() };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
      mountResolver();
      await new Promise((resolve) => { setTimeout(resolve, 0); });

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(store.state.saveConflict).toBe(null);
    });

    it('has a "review later" control that dismisses without writing anything', async () => {
      const conflict = { yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now() };
      store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
      const wrapper = mountResolver();
      await wrapper.vm.$nextTick();

      const dismissBtn = wrapper.find('.dismiss-btn');
      expect(dismissBtn.exists()).toBe(true);
      await dismissBtn.trigger('click');

      expect(store.state.saveConflict).toBe(null);
      expect(request.post).not.toHaveBeenCalled();
    });
  });
});
