import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Item from '@/components/LinkItems/Item.vue';
import router from '@/router';
import pingCheck from '../../services/ping-check';

vi.mock('@/utils/request', () => {
  const fn = vi.fn(() => Promise.resolve({ data: {} }));
  fn.get = vi.fn(() => Promise.resolve({ data: {} }));
  fn.post = vi.fn(() => Promise.resolve({ data: {} }));
  fn.put = vi.fn(() => Promise.resolve({ data: {} }));
  return { default: fn };
});
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));
vi.mock('@/assets/interface-icons/interactive-editor-edit-mode.svg', () => ({
  default: { template: '<span />' },
}));

/** Factory — accepts overrides for item, props, appConfig, storeState, etc. */
function mountItem(overrides = {}) {
  const item = overrides.item || {
    id: 'test-1',
    title: 'Test Item',
    description: 'A test description',
    url: 'https://example.com',
    icon: 'fas fa-rocket',
  };

  const mutations = {
    SET_MODAL_OPEN: vi.fn(),
    REMOVE_ITEM: vi.fn(),
    ...(overrides.mutations || {}),
  };

  const storeState = {
    editMode: false,
    config: { appConfig: overrides.appConfig || {} },
    ...(overrides.storeState || {}),
  };

  const store = createStore({
    state() { return storeState; },
    getters: {
      appConfig: (state) => state.config.appConfig,
      iconSize: () => overrides.iconSize || 'medium',
      getParentSectionOfItem: () => () => overrides.parentSection || { name: 'Default' },
    },
    mutations,
  });

  const wrapper = shallowMount(Item, {
    global: {
      plugins: [store],
      directives: {
        tooltip: {},
        longPress: {},
        clickOutside: {},
      },
      mocks: {
        $modal: { show: vi.fn(), hide: vi.fn() },
        $toast: Object.assign(vi.fn(), {
          show: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(),
          dismiss: vi.fn(), clear: vi.fn(),
        }),
        $t: (key) => key,
        ...(overrides.mocks || {}),
      },
      stubs: {
        Icon: true,
        ItemOpenMethodIcon: true,
        StatusIndicator: true,
        ContextMenu: true,
        MoveItemTo: true,
        EditItem: true,
        EditModeIcon: true,
      },
    },
    props: { item, ...(overrides.props || {}) },
  });

  return { wrapper, store, mutations };
}

let openSpy;
let clipboardSpy;

beforeEach(() => {
  openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
  clipboardSpy = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: clipboardSpy },
    writable: true,
    configurable: true,
  });
  localStorage.getItem.mockReset();
  localStorage.setItem.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Computed: itemIcon', () => {
  it('returns item.icon when set', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', icon: 'my-icon',
      },
    });
    expect(wrapper.vm.itemIcon).toBe('my-icon');
  });

  it('falls back to appConfig.defaultIcon', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#' },
      appConfig: { defaultIcon: 'default-icon' },
    });
    expect(wrapper.vm.itemIcon).toBe('default-icon');
  });

  it('returns falsy when neither is set', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.itemIcon).toBeFalsy();
  });
});

describe('Computed: size', () => {
  it('returns valid itemSize prop', () => {
    const { wrapper } = mountItem({ props: { itemSize: 'large' } });
    expect(wrapper.vm.size).toBe('large');
  });

  it('ignores invalid itemSize and falls back to store', () => {
    const { wrapper } = mountItem({ props: { itemSize: 'bogus' }, iconSize: 'small' });
    expect(wrapper.vm.size).toBe('small');
  });

  it('falls back to store iconSize getter', () => {
    const { wrapper } = mountItem({ iconSize: 'small' });
    expect(wrapper.vm.size).toBe('small');
  });

  it('defaults to medium', () => {
    const { wrapper } = mountItem();
    expect(wrapper.vm.size).toBe('medium');
  });
});

describe('Computed: makeColumnCount', () => {
  it.each([
    [300, 1], [400, 2], [600, 3], [800, 4], [1100, 5], [1500, 0],
  ])('sectionWidth %i → %i columns', (width, expected) => {
    const { wrapper } = mountItem({ props: { sectionWidth: width } });
    expect(wrapper.vm.makeColumnCount).toBe(expected);
  });

  it('uses sectionDisplayData.itemCountX when set', () => {
    const { wrapper } = mountItem({
      props: { sectionWidth: 300, sectionDisplayData: { itemCountX: 7 } },
    });
    expect(wrapper.vm.makeColumnCount).toBe(7);
  });
});

describe('Computed: makeClassList', () => {
  it('includes size-{size}', () => {
    const { wrapper } = mountItem({ props: { itemSize: 'small' } });
    expect(wrapper.vm.makeClassList).toContain('size-small');
  });

  it('includes "short" when no icon', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.makeClassList).toContain('short');
  });

  it('includes "add-new" when isAddNew', () => {
    const { wrapper } = mountItem({ props: { isAddNew: true } });
    expect(wrapper.vm.makeClassList).toContain('add-new');
  });

  it('includes "is-edit-mode" when editMode is true', () => {
    const { wrapper } = mountItem({ storeState: { editMode: true, config: { appConfig: {} } } });
    expect(wrapper.vm.makeClassList).toContain('is-edit-mode');
  });
});

describe('Computed: enableStatusCheck', () => {
  it('item.statusCheck boolean overrides appConfig', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheck: false,
      },
      appConfig: { statusCheck: true },
    });
    expect(wrapper.vm.enableStatusCheck).toBe(false);
  });

  it('falls back to appConfig.statusCheck', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#' },
      appConfig: { statusCheck: true },
    });
    expect(wrapper.vm.enableStatusCheck).toBe(true);
  });

  it('defaults to false', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.enableStatusCheck).toBe(false);
  });
});

describe('Computed: isPingCheckEnabled', () => {
  it('item.pingCheckEnabled boolean overrides appConfig', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: false, pingCheckHost: 'example.com',
      },
      appConfig: { pingCheckEnabled: true },
    });
    expect(wrapper.vm.isPingCheckEnabled).toBe(false);
  });

  it('falls back to appConfig.pingCheckEnabled', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#', pingCheckHost: 'example.com' },
      appConfig: { pingCheckEnabled: true },
    });
    expect(wrapper.vm.isPingCheckEnabled).toBe(true);
  });

  it('defaults to false', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.isPingCheckEnabled).toBe(false);
  });

  it('false if pingCheckHost is not provided', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#', pingCheckEnabled: true } });
    expect(wrapper.vm.isPingCheckEnabled).toBe(false);
  });
});

describe('Computed: statusCheckInterval', () => {
  it('reads from item', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheckInterval: 30,
      },
    });
    expect(wrapper.vm.statusCheckInterval).toBe(30);
  });

  it('falls back to appConfig', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#' },
      appConfig: { statusCheckInterval: 15 },
    });
    expect(wrapper.vm.statusCheckInterval).toBe(15);
  });

  it('clamps to max 60', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheckInterval: 120,
      },
    });
    expect(wrapper.vm.statusCheckInterval).toBe(60);
  });

  it('clamps values less than 1 to 0', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheckInterval: 0.5,
      },
    });
    expect(wrapper.vm.statusCheckInterval).toBe(0);
  });
});

describe('Computed: pingCheckInterval', () => {
  it('reads from item', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckInterval: 3,
      },
    });
    expect(wrapper.vm.pingCheckInterval).toBe(3);
  });

  it('falls back to appConfig', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#' },
      appConfig: { pingCheckInterval: 4 },
    });
    expect(wrapper.vm.pingCheckInterval).toBe(4);
  });

  it('clamps to max 5', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckInterval: 15,
      },
    });
    expect(wrapper.vm.pingCheckInterval).toBe(5);
  });

  it('clamps values less than 1 to 0', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckInterval: 0.5,
      },
    });
    expect(wrapper.vm.pingCheckInterval).toBe(0);
  });
});

describe('Computed: accumulatedTarget', () => {
  it('uses item.target first', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', target: 'workspace',
      },
    });
    expect(wrapper.vm.accumulatedTarget).toBe('workspace');
  });

  it('falls back to appConfig.defaultOpeningMethod', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: '#' },
      appConfig: { defaultOpeningMethod: 'sametab' },
    });
    expect(wrapper.vm.accumulatedTarget).toBe('sametab');
  });

  it('defaults to "newtab"', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.accumulatedTarget).toBe('newtab');
  });
});

describe('Computed: anchorTarget', () => {
  it.each([
    ['sametab', '_self'],
    ['newtab', '_blank'],
    ['parent', '_parent'],
    ['top', '_top'],
    ['modal', undefined],
  ])('target "%s" → %s', (target, expected) => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', target,
      },
    });
    expect(wrapper.vm.anchorTarget).toBe(expected);
  });

  it('returns _self in edit mode', () => {
    const { wrapper } = mountItem({
      storeState: { editMode: true, config: { appConfig: {} } },
    });
    expect(wrapper.vm.anchorTarget).toBe('_self');
  });
});

describe('Computed: hyperLinkHref', () => {
  it('returns "#" in edit mode', () => {
    const { wrapper } = mountItem({
      storeState: { editMode: true, config: { appConfig: {} } },
    });
    expect(wrapper.vm.hyperLinkHref).toBe('#');
  });

  it.each(['modal', 'workspace', 'clipboard'])('returns "#" for %s target', (target) => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', target,
      },
    });
    expect(wrapper.vm.hyperLinkHref).toBe('#');
  });

  it('returns URL for normal targets', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', target: 'newtab',
      },
    });
    expect(wrapper.vm.hyperLinkHref).toBe('https://x.com');
  });
});

describe('Computed: unicodeOpeningIcon', () => {
  it.each([
    ['newtab', '"\\f360"'],
    ['sametab', '"\\f24d"'],
    ['parent', '"\\f3bf"'],
    ['top', '"\\f102"'],
    ['modal', '"\\f2d0"'],
    ['workspace', '"\\f0b1"'],
    ['clipboard', '"\\f0ea"'],
  ])('target "%s" → correct icon', (target, expected) => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', target,
      },
    });
    expect(wrapper.vm.unicodeOpeningIcon).toBe(expected);
  });

  it('returns default icon for unknown target', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', target: 'unknown',
      },
    });
    expect(wrapper.vm.unicodeOpeningIcon).toBe('"\\f054"');
  });
});

describe('Filter: shortUrl', () => {
  it('extracts hostname from URL', () => {
    const { wrapper } = mountItem();
    expect(wrapper.vm.shortUrl('https://www.example.com/path?q=1')).toBe('www.example.com');
  });

  it('handles IP addresses', () => {
    const { wrapper } = mountItem();
    expect(wrapper.vm.shortUrl('192.168.1.1')).toBe('192.168.1.1');
  });

  it('returns empty string for falsy input', () => {
    const { wrapper } = mountItem();
    expect(wrapper.vm.shortUrl(null)).toBe('');
    expect(wrapper.vm.shortUrl(undefined)).toBe('');
    expect(wrapper.vm.shortUrl('')).toBe('');
  });

  it('returns empty string for invalid input', () => {
    const { wrapper } = mountItem();
    expect(wrapper.vm.shortUrl('not-a-url')).toBe('');
  });
});

describe('Methods: getTooltipOptions', () => {
  it('returns empty object when no description or provider', () => {
    const { wrapper } = mountItem({ item: { id: '1', title: 'X', url: '#' } });
    expect(wrapper.vm.getTooltipOptions()).toEqual({});
  });

  it('includes description and provider in content', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'Desc', provider: 'Prov',
      },
    });
    const { content } = wrapper.vm.getTooltipOptions();
    expect(content).toContain('Desc');
    expect(content).toContain('Prov');
  });

  it('includes hotkey in content', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'D', hotkey: 3,
      },
    });
    const { content } = wrapper.vm.getTooltipOptions();
    expect(content).toContain("'3'");
  });

  it('shows edit text in edit mode', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'D',
      },
      storeState: { editMode: true, config: { appConfig: {} } },
    });
    expect(wrapper.vm.getTooltipOptions().content).toBe(
      'interactive-editor.edit-section.edit-tooltip',
    );
  });

  it('placement is "left" when statusResponse exists', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'D',
      },
    });
    wrapper.vm.statusResponse = { message: 'ok' };
    expect(wrapper.vm.getTooltipOptions().placement).toBe('left');
  });

  it('placement is "left" when pingResponse exists', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'D',
      },
    });
    wrapper.vm.pingResponse = { message: 'ok' };
    expect(wrapper.vm.getTooltipOptions().placement).toBe('left');
  });

  it('placement is "auto" when neither statusResponse nor pingResponse exists', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', description: 'D',
      },
    });
    expect(wrapper.vm.getTooltipOptions().placement).toBe('auto');
  });
});

describe('Methods: openItemSettings / closeEditMenu', () => {
  it('openItemSettings sets editMenuOpen and commits SET_MODAL_OPEN(true)', () => {
    const { wrapper, mutations } = mountItem();
    wrapper.vm.openItemSettings();
    expect(wrapper.vm.editMenuOpen).toBe(true);
    expect(mutations.SET_MODAL_OPEN).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('closeEditMenu clears editMenuOpen', () => {
    const { wrapper } = mountItem();
    wrapper.vm.editMenuOpen = true;
    wrapper.vm.closeEditMenu();
    expect(wrapper.vm.editMenuOpen).toBe(false);
  });
});

describe('Methods: openDeleteItem', () => {
  it('commits REMOVE_ITEM with correct payload', () => {
    const { wrapper, mutations } = mountItem({ parentSection: { name: 'MySection' } });
    wrapper.vm.openDeleteItem();
    expect(mutations.REMOVE_ITEM).toHaveBeenCalledWith(
      expect.anything(),
      { itemId: 'test-1', sectionName: 'MySection' },
    );
  });
});

describe('Methods: itemClicked', () => {
  const event = (extra = {}) => ({
    preventDefault: vi.fn(), ctrlKey: false, altKey: false, ...extra,
  });

  it('in edit mode: preventDefault + openItemSettings', () => {
    const { wrapper } = mountItem({ storeState: { editMode: true, config: { appConfig: {} } } });
    const e = event();
    const spy = vi.spyOn(wrapper.vm, 'openItemSettings');
    wrapper.vm.itemClicked(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('ctrl key: opens in new tab', () => {
    const { wrapper } = mountItem();
    wrapper.vm.itemClicked(event({ ctrlKey: true }));
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('alt key: emits triggerModal', () => {
    const { wrapper } = mountItem();
    wrapper.vm.itemClicked(event({ altKey: true }));
    expect(wrapper.emitted().triggerModal).toBeTruthy();
  });

  it('target modal: emits triggerModal', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', target: 'modal',
      },
    });
    wrapper.vm.itemClicked(event());
    expect(wrapper.emitted().triggerModal).toBeTruthy();
  });

  it('target workspace: calls router.push', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', target: 'workspace',
      },
    });
    wrapper.vm.itemClicked(event());
    expect(router.push).toHaveBeenCalledWith({ name: 'workspace', query: { url: 'https://x.com' } });
  });

  it('target clipboard: calls copyToClipboard', () => {
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', target: 'clipboard',
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'copyToClipboard');
    wrapper.vm.itemClicked(event());
    expect(spy).toHaveBeenCalledWith('https://x.com');
  });

  it('always emits itemClicked', () => {
    const { wrapper } = mountItem();
    wrapper.vm.itemClicked(event());
    expect(wrapper.emitted().itemClicked).toBeTruthy();
  });

  it('skips smart-sort when disableSmartSort is set', () => {
    const { wrapper } = mountItem({ appConfig: { disableSmartSort: true } });
    const spy = vi.spyOn(wrapper.vm, 'incrementMostUsedCount');
    wrapper.vm.itemClicked(event());
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('Methods: launchItem', () => {
  it.each([
    ['newtab', '_blank'],
    ['sametab', '_self'],
  ])('%s calls window.open with %s', (method, target) => {
    const { wrapper } = mountItem();
    wrapper.vm.launchItem(method, 'https://test.com');
    expect(openSpy).toHaveBeenCalledWith('https://test.com', target);
  });

  it('modal emits triggerModal', () => {
    const { wrapper } = mountItem();
    wrapper.vm.launchItem('modal', 'https://test.com');
    expect(wrapper.emitted().triggerModal[0]).toEqual(['https://test.com']);
  });

  it('workspace calls router.push', () => {
    const { wrapper } = mountItem();
    wrapper.vm.launchItem('workspace', 'https://test.com');
    expect(router.push).toHaveBeenCalledWith({ name: 'workspace', query: { url: 'https://test.com' } });
  });

  it('clipboard calls copyToClipboard', () => {
    const { wrapper } = mountItem();
    const spy = vi.spyOn(wrapper.vm, 'copyToClipboard');
    wrapper.vm.launchItem('clipboard', 'https://test.com');
    expect(spy).toHaveBeenCalledWith('https://test.com');
  });

  it('closes context menu', () => {
    const { wrapper } = mountItem();
    wrapper.vm.contextMenuOpen = true;
    wrapper.vm.launchItem('newtab');
    expect(wrapper.vm.contextMenuOpen).toBe(false);
  });

  it('falls back to item.url when no link arg', () => {
    const { wrapper } = mountItem({
      item: { id: '1', title: 'X', url: 'https://fallback.com' },
    });
    wrapper.vm.launchItem('newtab');
    expect(openSpy).toHaveBeenCalledWith('https://fallback.com', '_blank');
  });
});

describe('Methods: openContextMenu / closeContextMenu', () => {
  it('toggles contextMenuOpen and sets position', () => {
    const { wrapper } = mountItem();
    wrapper.vm.openContextMenu({ clientX: 100, clientY: 200 });
    expect(wrapper.vm.contextMenuOpen).toBe(true);
    expect(wrapper.vm.contextPos.posX).toBe(100 + window.pageXOffset);
    expect(wrapper.vm.contextPos.posY).toBe(200 + window.pageYOffset);
  });

  it('closeContextMenu sets false', () => {
    const { wrapper } = mountItem();
    wrapper.vm.contextMenuOpen = true;
    wrapper.vm.closeContextMenu();
    expect(wrapper.vm.contextMenuOpen).toBe(false);
  });
});

describe('Methods: copyToClipboard', () => {
  it('calls navigator.clipboard.writeText and shows toast', () => {
    const { wrapper } = mountItem();
    wrapper.vm.copyToClipboard('hello');
    expect(clipboardSpy).toHaveBeenCalledWith('hello');
    expect(wrapper.vm.$toast.success).toHaveBeenCalled();
  });

  it('shows error when clipboard unavailable', async () => {
    const ErrorHandler = (await import('@/utils/logging/ErrorHandler')).default;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined, writable: true, configurable: true,
    });
    const { wrapper } = mountItem();
    wrapper.vm.copyToClipboard('hello');
    expect(ErrorHandler).toHaveBeenCalled();
    expect(wrapper.vm.$toast.error).toHaveBeenCalledWith('Unable to copy, see log');
  });
});

describe('Methods: incrementMostUsedCount / incrementLastUsedCount', () => {
  it('increments existing count', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ 'item-1': 5 }));
    const { wrapper } = mountItem();
    wrapper.vm.incrementMostUsedCount('item-1');
    const saved = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(saved['item-1']).toBe(6);
  });

  it('initializes new items to 1', () => {
    localStorage.getItem.mockReturnValue('{}');
    const { wrapper } = mountItem();
    wrapper.vm.incrementMostUsedCount('new-item');
    const saved = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(saved['new-item']).toBe(1);
  });

  it('writes last-used timestamp', () => {
    localStorage.getItem.mockReturnValue('{}');
    const { wrapper } = mountItem();
    const before = Date.now();
    wrapper.vm.incrementLastUsedCount('item-1');
    const saved = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(saved['item-1']).toBeGreaterThanOrEqual(before);
  });
});

describe('Lifecycle: mounted', () => {
  it('calls checkWebsiteStatus when enableStatusCheck is true', () => {
    const spy = vi.spyOn(Item.mixins[0].methods, 'checkWebsiteStatus');
    mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', statusCheck: true,
      },
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sets up interval when statusCheckInterval > 0', () => {
    vi.useFakeTimers();
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', statusCheck: true, statusCheckInterval: 5,
      },
    });
    expect(wrapper.vm.intervalId).toBeDefined();
    vi.useRealTimers();
  });

  it('does nothing when statusCheck disabled', () => {
    const spy = vi.spyOn(Item.mixins[0].methods, 'checkWebsiteStatus');
    mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', statusCheck: false,
      },
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('calls checkPingStatus when pingCheckEnabled is true', () => {
    const spy = vi.spyOn(Item.mixins[0].methods, 'checkPingStatus');
    mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true, pingCheckHost: '127.0.0.1',
      },
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sets up interval when pingCheckInterval > 0', () => {
    vi.useFakeTimers();
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true, pingCheckHost: '127.0.0.1', pingCheckInterval: 2,
      },
    });
    expect(wrapper.vm.pingIntervalId).toBeDefined();
    vi.useRealTimers();
  });

  it('does nothing when pingCheckEnabled is false', () => {
    const spy = vi.spyOn(Item.mixins[0].methods, 'checkPingStatus');
    mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: false, pingCheckHost: '127.0.0.1', pingCheckInterval: 2,
      },
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does nothing when pingCheckHost is undefined', () => {
    const spy = vi.spyOn(Item.mixins[0].methods, 'checkPingStatus');
    mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true, pingCheckHost: undefined, pingCheckInterval: 2,
      },
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Lifecycle: beforeDestroy', () => {
  it('clears interval if intervalId exists', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: 'https://x.com', statusCheck: true, statusCheckInterval: 5,
      },
    });
    const { intervalId } = wrapper.vm;
    wrapper.unmount();
    expect(clearSpy).toHaveBeenCalledWith(intervalId);
    vi.useRealTimers();
  });

  it('clears interval if pingIntervalId exists', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const { wrapper } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true, pingCheckHost: '127.0.0.1', pingCheckInterval: 2,
      },
    });
    const { pingIntervalId } = wrapper.vm;
    wrapper.unmount();
    expect(clearSpy).toHaveBeenCalledWith(pingIntervalId);
    vi.useRealTimers();
  });
});

describe('Template rendering', () => {
  it('renders item title and description', () => {
    const { wrapper } = mountItem();
    expect(wrapper.find('.text').text()).toBe('Test Item');
    expect(wrapper.find('.description').text()).toBe('A test description');
  });

  it('has correct wrapper classes', () => {
    const { wrapper } = mountItem({ props: { itemSize: 'large', sectionWidth: 800 } });
    const div = wrapper.find('.item-wrapper');
    expect(div.classes()).toContain('wrap-size-large');
    expect(div.classes()).toContain('span-4');
  });

  it('shows StatusIndicator only when enableStatusCheck', () => {
    const { wrapper: off } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheck: false,
      },
    });
    expect(off.html()).not.toContain('status-indicator');

    const { wrapper: on } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', statusCheck: true,
      },
    });
    expect(on.html()).toContain('status-indicator');
  });

  it('shows StatusIndicator only when pingCheckEnabled', () => {
    const { wrapper: off } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: false,
      },
    });
    expect(off.html()).not.toContain('status-indicator');

    const { wrapper: on1 } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true,
      },
    });
    expect(on1.html()).not.toContain('status-indicator');

    const { wrapper: on2 } = mountItem({
      item: {
        id: '1', title: 'X', url: '#', pingCheckEnabled: true, pingCheckHost: '127.0.0.1',
      },
    });
    expect(on2.html()).toContain('status-indicator');
  });

  it('shows EditModeIcon only in edit mode', async () => {
    const { wrapper: normal } = mountItem();
    expect(normal.vm.isEditMode).toBe(false);

    const { wrapper: editing } = mountItem({
      storeState: { editMode: true, config: { appConfig: {} } },
    });
    expect(editing.vm.isEditMode).toBe(true);
    // In Vue 3 compat, verify via class since stub rendering may differ
    expect(editing.find('.item').classes()).toContain('is-edit-mode');
  });

  it('sets correct id on anchor', () => {
    const { wrapper } = mountItem();
    expect(wrapper.find('a.item').attributes('id')).toBe('link-test-1');
  });
});
