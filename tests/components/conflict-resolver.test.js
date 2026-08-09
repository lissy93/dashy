import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
// ConfigHelpers must finish loading before store.js does, otherwise the
// store.js -> ConfigHelpers -> ConfigAccumalator -> store.js import cycle
// hands ConfigAccumalator an uninitialized `$store` binding and throws.
import '@/utils/config/ConfigHelpers';
import ConflictResolver from '@/components/Configuration/ConflictResolver.vue';

// The merge view touches DOM APIs happy-dom doesn't fully implement, so stub it
vi.mock('@codemirror/merge', () => ({
  MergeView: class {
    constructor() {
      this.a = {};
      this.b = { state: { doc: { toString: () => 'merged: true' } } };
      this.chunks = [{ fromA: 0, toA: 1 }, { fromA: 4, toA: 6 }]; // two hunks
    }

    destroy() {}
  },
}));

const makeStore = (saveConflict) => createStore({
  state: { saveConflict },
  mutations: { SET_SAVE_CONFLICT(state, v) { state.saveConflict = v; } },
});

const stubs = {
  Button: { template: '<button><slot /></button>' },
  ConfirmDialog: { props: ['open'], template: '<div class="confirm-stub" v-if="open" />' },
};
const mocks = { $t: (k, v) => `${k}${v ? JSON.stringify(v) : ''}`, $toast: { error: vi.fn() } };

describe('ConflictResolver', () => {
  it('renders nothing when there is no conflict', () => {
    const wrapper = mount(ConflictResolver, { global: { plugins: [makeStore(null)], stubs, mocks } });
    expect(wrapper.find('.conflict-resolver').exists()).toBe(false);
  });

  it('renders the resolver when a conflict is present', () => {
    const conflict = { yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now() };
    const wrapper = mount(ConflictResolver, { global: { plugins: [makeStore(conflict)], stubs, mocks } });
    expect(wrapper.find('.conflict-resolver').exists()).toBe(true);
  });

  it('reports the merge view hunk count, not a line count', async () => {
    // 'theirs' differs from 'yours' on many lines, but the mocked MergeView
    // reports two hunks - the summary must follow the hunks
    const conflict = {
      yours: 'a: 1\nb: 2\nc: 3\nd: 4\ne: 5\n',
      theirs: 'z: 9\na: 1\nb: 2\nc: 3\nd: 4\ne: 5\n',
      theirMtime: Date.now(),
    };
    const wrapper = mount(ConflictResolver, { global: { plugins: [makeStore(conflict)], stubs, mocks } });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.changeCount).toBe(2);
  });

  it('does not overwrite until the confirm dialog is accepted', async () => {
    const conflict = { yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now() };
    const wrapper = mount(ConflictResolver, { global: { plugins: [makeStore(conflict)], stubs, mocks } });
    const forceSave = vi.spyOn(wrapper.vm, 'forceSave').mockImplementation(() => {});
    wrapper.vm.overwrite();
    expect(wrapper.vm.showOverwriteConfirm).toBe(true);
    expect(forceSave).not.toHaveBeenCalled();
    wrapper.vm.confirmOverwrite();
    expect(forceSave).toHaveBeenCalledWith('a: 1\n');
  });

  it('clears the conflict when dismissed', async () => {
    const conflict = { yours: 'a: 1\n', theirs: 'a: 2\n', theirMtime: Date.now() };
    const store = makeStore(conflict);
    const wrapper = mount(ConflictResolver, { global: { plugins: [store], stubs, mocks } });
    wrapper.vm.dismiss();
    expect(store.state.saveConflict).toBe(null);
  });
});
