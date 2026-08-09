import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  describe, it, expect, vi,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
// A REAL @codemirror/merge is used throughout this file (no vi.mock), so the
// CSS selectors in ConflictResolver.vue's <style> block are checked against
// classes the package actually emits, and so a real MergeView's reactivity
// behaviour (Minor 1) can be exercised. tests/components/conflict-resolver.test.js
// and conflict-resolver-resolution.test.js mock @codemirror/merge for
// unrelated plumbing/store assertions - this file is deliberately the one
// place the real merge engine runs, so the CSS can never silently drift from
// what the library actually renders.
import { MergeView } from '@codemirror/merge';
import { EditorView } from '@codemirror/view';
import { yaml } from '@codemirror/lang-yaml';
// ConfigHelpers must finish loading before store.js does, otherwise the
// store.js -> ConfigHelpers -> ConfigAccumalator -> store.js import cycle
// hands ConfigAccumalator an uninitialized `$store` binding and throws.
import { toSaveShape } from '@/utils/config/ConfigHelpers';
import ConflictResolver from '@/components/Configuration/ConflictResolver.vue';
import { dump } from '@/utils/yaml';
import store from '@/store';
import StoreKeys from '@/utils/StoreMutations';
import request from '@/utils/request';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const makeStore = (saveConflict) => createStore({
  state: { saveConflict, currentConfigInfo: {} },
  mutations: {
    SET_SAVE_CONFLICT(state, v) { state.saveConflict = v; },
    SET_EDIT_MODE() {},
  },
  actions: { INITIALIZE_CONFIG: vi.fn() },
});

const stubs = {
  Button: { props: ['click', 'disallow'], template: '<button @click="click"><slot /></button>' },
  ConfirmDialog: { props: ['open'], template: '<div class="confirm-stub" v-if="open" />' },
};
const mocks = { $t: (k, v) => `${k}${v ? JSON.stringify(v) : ''}`, $toast: { error: vi.fn(), success: vi.fn() } };

describe('Real @codemirror/merge construction (Important 4)', () => {
  it('constructs a real side-by-side MergeView under happy-dom without throwing', () => {
    const parent = document.createElement('div');
    let error = null;
    let view;
    try {
      view = new MergeView({
        a: { doc: 'a: 1\nb: 2\n', extensions: [yaml(), EditorView.editable.of(false)] },
        b: { doc: 'a: 1\nb: 3\n', extensions: [yaml()] },
        parent,
        highlightChanges: true,
        gutter: true,
      });
    } catch (e) {
      error = e;
    }
    // If this ever fails, the fallback (per the task instructions) is to assert
    // selectors against classes extracted from the installed package source
    // instead - but happy-dom handles it fine, confirmed here.
    expect(error).toBe(null);
    view.destroy();
  });

  it('emits .cm-merge-a / .cm-merge-b ancestor classes and .cm-changedLine on BOTH sides - ' +
    'NOT .cm-deletedChunk/.cm-insertedLine, which are unified-view-only', () => {
    const parent = document.createElement('div');
    const view = new MergeView({
      a: { doc: 'a: 1\nb: 2\n', extensions: [yaml(), EditorView.editable.of(false)] },
      b: { doc: 'a: 1\nb: 3\n', extensions: [yaml()] },
      parent,
      highlightChanges: true,
      gutter: true,
    });

    const html = parent.innerHTML;
    expect(html).toContain('cm-merge-a');
    expect(html).toContain('cm-merge-b');
    expect(parent.querySelectorAll('.cm-changedLine').length).toBeGreaterThanOrEqual(2);
    expect(parent.querySelector('.cm-merge-a .cm-changedLine')).not.toBe(null);
    expect(parent.querySelector('.cm-merge-b .cm-changedLine')).not.toBe(null);
    expect(parent.querySelector('.cm-changedLineGutter')).not.toBe(null);
    expect(parent.querySelector('.cm-changedText')).not.toBe(null);
    // The unified-view-only block class must never appear in the side-by-side view
    expect(html).not.toContain('cm-deletedChunk');

    view.destroy();
  });

  it("ConflictResolver's actual createMergeView wires up the real merge engine and finds a first hunk to scroll to", async () => {
    const conflict = {
      yours: 'a: 1\nb: 3\n', theirs: 'a: 1\nb: 2\n', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      attachTo: document.body,
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.view).not.toBe(null);
    expect(wrapper.vm.changeCount).toBeGreaterThan(0);
    const mergeEl = wrapper.find('.merge-container').element;
    expect(mergeEl.querySelector('.cm-merge-a .cm-changedLine')).not.toBe(null);
    expect(mergeEl.querySelector('.cm-merge-b .cm-changedLine')).not.toBe(null);

    wrapper.unmount();
  });
});

describe('Minor 1 - computeds stay live as the merge doc changes (real MergeView)', () => {
  it('isMergedValid flips to false once the editable ("yours") pane is edited into broken YAML', async () => {
    const conflict = {
      yours: 'a: 1\nb: 2\n', theirs: 'a: 1\nb: 3\n', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      attachTo: document.body,
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isMergedValid).toBe(true);

    // Simulate the user typing invalid YAML directly into the editable "yours" pane
    wrapper.vm.view.b.dispatch({
      changes: { from: 0, to: wrapper.vm.view.b.state.doc.length, insert: 'a: [1, 2\n  not: valid: yaml: ][' },
    });
    await wrapper.vm.$nextTick();

    // Without the updateListener wiring the doc change into a reactive
    // counter, this computed would still report the doc as it was at mount
    expect(wrapper.vm.isMergedValid).toBe(false);

    wrapper.unmount();
  });

  it('changeCount updates after the doc changes converge the two sides', async () => {
    const conflict = {
      yours: 'a: 1\nb: 2\n', theirs: 'a: 1\nb: 3\n', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      attachTo: document.body,
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const initialCount = wrapper.vm.changeCount;
    expect(initialCount).toBeGreaterThan(0);

    // Make "yours" (b) identical to "theirs" as actually displayed (the "a"
    // pane's doc, which normalizeTheirs may have reshaped) - not the raw
    // conflict.theirs text, which normalization no longer echoes verbatim
    // for a non-config-shaped fixture like this one.
    const theirsAsDisplayed = wrapper.vm.view.a.state.doc.toString();
    wrapper.vm.view.b.dispatch({
      changes: { from: 0, to: wrapper.vm.view.b.state.doc.length, insert: theirsAsDisplayed },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.changeCount).toBe(0);

    wrapper.unmount();
  });
});

describe('Important A - normalized "theirs" matches the real production "yours" shape, removing ' +
  'serialization-noise hunks', () => {
  const countHunks = (theirsDoc, yoursDoc) => {
    const parent = document.createElement('div');
    const view = new MergeView({
      a: { doc: theirsDoc, extensions: [yaml(), EditorView.editable.of(false)] },
      b: { doc: yoursDoc, extensions: [yaml()] },
      parent,
      highlightChanges: true,
      gutter: true,
    });
    const { length } = view.chunks;
    view.destroy();
    return length;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    store.commit(StoreKeys.SET_SAVE_CONFLICT, null);
    store.state.rootConfig = null;
    store.state.rootConfigHash = null;
    store.state.currentConfigInfo = {};
  });

  it('root: a zero-edit disk file produces zero hunks against "yours" as the real store/save ' +
    'pipeline actually builds it - not a tautology, this exercises INITIALIZE_ROOT_CONFIG, ' +
    'INITIALIZE_CONFIG and toSaveShape (the exact function writeConfigToDisk uses)', async () => {
    const raw = readFileSync(path.resolve(__dirname, '../../user-data/conf.yml'), 'utf8');
    request.get.mockResolvedValue({ data: raw, headers: new Headers({ 'x-config-hash': 'root-hash' }) });

    // Real store dispatch - this is the actual production code path that
    // builds state.config for the root config (buildRootEffective), not a
    // hand-rolled stand-in for it.
    await store.dispatch(StoreKeys.INITIALIZE_ROOT_CONFIG);
    await store.dispatch(StoreKeys.INITIALIZE_CONFIG);

    // Exactly what ConfigSaving.js's writeConfigToDisk would send as "yours"
    // for a zero-edit save of the config INITIALIZE_CONFIG just built
    // configSource (not state.config) is what real saves serialize from -
    // state.config carries runtime-only item `id`s injected by the SET_CONFIG
    // mutation's applyItemId() call, which never reach disk.
    const yours = dump(JSON.parse(JSON.stringify(toSaveShape(store.state.configSource, false))));

    const conflict = {
      yours, theirs: raw, theirMtime: Date.now(),
    };
    store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
    const wrapper = mount(ConflictResolver, {
      global: { plugins: [store], stubs, mocks },
    });
    await wrapper.vm.$nextTick();

    const beforeFixHunks = countHunks(raw, yours);
    const afterFixHunks = countHunks(wrapper.vm.normalizeTheirs(raw), yours);

    // Not hard-coded to a specific number (Minor finding) - any edit to the
    // shipped example file must not break this test for an unrelated reason.
    expect(beforeFixHunks).toBeGreaterThan(0);
    expect(afterFixHunks).toBe(0);

    wrapper.unmount();
  });

  it('sub-page: a zero-edit sub-config file produces zero hunks against "yours" as ' +
    'INITIALIZE_CONFIG(subId) + toSaveShape actually build it', async () => {
    const rootYaml = [
      'pageInfo: {}',
      'appConfig: {}',
      'sections: []',
      'pages:',
      '  - name: Sub Page',
      '    path: ./sub.yml',
      '',
    ].join('\n');
    const subRaw = [
      'appConfig:',
      '  language: en',
      'pageInfo:',
      '  title: Sub Title',
      'sections:',
      '  - name: Sub Section',
      '    items: []',
      '',
    ].join('\n');
    request.get.mockImplementation((url) => {
      if (String(url).includes('sub.yml')) {
        return Promise.resolve({ data: subRaw, headers: new Headers({ 'x-config-hash': 'sub-hash' }) });
      }
      return Promise.resolve({ data: rootYaml, headers: new Headers({ 'x-config-hash': 'root-hash' }) });
    });

    await store.dispatch(StoreKeys.INITIALIZE_ROOT_CONFIG);
    await store.dispatch(StoreKeys.INITIALIZE_CONFIG, 'sub-page');

    const yours = dump(JSON.parse(JSON.stringify(
      toSaveShape(store.state.configSource, true),
    )));

    const conflict = {
      yours, theirs: subRaw, theirMtime: Date.now(),
    };
    store.commit(StoreKeys.SET_SAVE_CONFLICT, conflict);
    const wrapper = mount(ConflictResolver, {
      global: { plugins: [store], stubs, mocks },
    });
    await wrapper.vm.$nextTick();

    const afterFixHunks = countHunks(wrapper.vm.normalizeTheirs(subRaw), yours);
    expect(afterFixHunks).toBe(0);

    wrapper.unmount();
  });

  it('falls back to the raw text when "theirs" fails to parse, instead of throwing', () => {
    const conflict = {
      yours: 'a: 1\n', theirs: 'not: valid: yaml: [', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });

    expect(() => wrapper.vm.normalizeTheirs('not: valid: yaml: [')).not.toThrow();
    expect(wrapper.vm.normalizeTheirs('not: valid: yaml: [')).toBe('not: valid: yaml: [');

    wrapper.unmount();
  });

  it('returns raw text unchanged when parsed YAML is a scalar (not a plain object)', () => {
    const conflict = {
      yours: 'a: 1\n', theirs: 'just a string', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });

    const raw = 'just a string';
    expect(wrapper.vm.normalizeTheirs(raw)).toBe(raw);

    wrapper.unmount();
  });

  it('returns raw text unchanged when parsed YAML is an array (not a plain object)', () => {
    const conflict = {
      yours: 'a: 1\n', theirs: '- item1\n- item2\n', theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, {
      global: { plugins: [makeStore(conflict)], stubs, mocks },
    });

    const raw = '- item1\n- item2\n';
    expect(wrapper.vm.normalizeTheirs(raw)).toBe(raw);

    wrapper.unmount();
  });
});

describe('Critical 2 - the resolver must out-rank Modal.vue and RemoteConfigLoader in the stacking order', () => {
  // happy-dom does not apply scoped-SCSS stylesheets to computed style (verified:
  // getComputedStyle().zIndex reads '' even after mounting with attachTo: document.body),
  // so this is asserted against the source declarations directly rather than a
  // runtime style read. #dashy (src/styles/global-styles.scss) has no z-index of its
  // own and therefore creates no stacking context, so ConflictResolver's fixed root
  // competes directly with Modal.vue's teleported-to-body .modal-overlay and with
  // RemoteConfigLoader - numeric ordering between the three files is what matters.
  const readZIndex = (file, selectorHint) => {
    const src = readFileSync(path.resolve(__dirname, '../../src/components', file), 'utf8');
    // Strip comments first, so a z-index number mentioned in an explanatory
    // comment can never be mistaken for the actual declared value
    const withoutComments = src.replace(/\/\*[\s\S]*?\*\//g, '');
    const match = withoutComments.match(/z-index:\s*(\d+)/);
    if (!match) throw new Error(`No z-index found in ${file} (${selectorHint})`);
    return Number(match[1]);
  };

  it('ConflictResolver z-index exceeds both Modal.vue .modal-overlay and RemoteConfigLoader', () => {
    const resolverZ = readZIndex('Configuration/ConflictResolver.vue', '.conflict-resolver');
    const modalZ = readZIndex('FormElements/Modal.vue', '.modal-overlay');
    const remoteConfigLoaderZ = readZIndex('Configuration/RemoteConfigLoader.vue', 'root');

    expect(modalZ).toBe(50);
    expect(remoteConfigLoaderZ).toBe(40);
    expect(resolverZ).toBeGreaterThan(modalZ);
    expect(resolverZ).toBeGreaterThan(remoteConfigLoaderZ);
  });
});
