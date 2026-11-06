import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';

/* Each sub-config fetch stays pending until the test settles it */
const fetches = [];
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn((url) => new Promise((resolve, reject) => {
      fetches.push({ url, resolve, reject });
    })),
  },
}));
vi.mock('@/utils/auth/Auth', () => ({
  isUserAdmin: () => true,
  makeBasicAuthHeaders: () => ({}),
  isLoggedInAsGuest: () => false,
  getUserState: () => 0,
  getCurrentUser: () => null,
}));
vi.mock('@/utils/logging/ErrorHandler', () => ({
  default: vi.fn(), InfoHandler: vi.fn(), InfoKeys: {},
}));

// Mixin first, as it pulls in ConfigHelpers, which must load before the store does
const { default: HomeMixin } = await import('@/mixins/HomeMixin');
const { default: store } = await import('@/store');
const { default: Keys } = await import('@/utils/StoreMutations');

const pageFile = (name) => `pageInfo:\n  title: ${name}\nsections:\n  - name: ${name} Section\n`;
const pending = (url) => fetches.find((f) => f.url === url && !f.settled);
const settle = async (url, ok = true) => {
  const f = pending(url);
  f.settled = true;
  if (ok) f.resolve({ data: pageFile(url.includes('page-a') ? 'Page A' : 'Page B') });
  else f.reject(new Error('Network Error'));
  await flushPromises();
};

/* Same as the Home, Minimal and Workspace views do on each route change */
const visit = (path, params = {}) => {
  const view = { $store: store, $route: { path, params }, ...HomeMixin.methods };
  view.loadUpConfig();
};
const shownSection = () => store.state.config.sections[0]?.name;

describe('Sub-page config loading', () => {
  beforeEach(async () => {
    fetches.length = 0;
    store.commit(Keys.SET_ROOT_CONFIG, {
      appConfig: {},
      pageInfo: { title: 'Home' },
      sections: [{ name: 'Root Section' }],
      pages: [{ name: 'Page A', path: 'page-a.yml' }, { name: 'Page B', path: 'page-b.yml' }],
    });
    await store.dispatch(Keys.INITIALIZE_CONFIG);
    store.commit(Keys.CRITICAL_ERROR_MSG, null);
  });

  it('keeps the root page when going back before a sub-page has loaded', async () => {
    visit('/home/page-a', { page: 'page-a' });
    visit('/');
    await settle('/page-a.yml');
    expect(store.state.currentConfigInfo.confId).toBeUndefined();
    expect(shownSection()).toBe('Root Section');
  });

  it('shows the newest page when an earlier sub-page loads last', async () => {
    visit('/home/page-a', { page: 'page-a' });
    visit('/home/page-b', { page: 'page-b' });
    await settle('/page-b.yml');
    await settle('/page-a.yml');
    expect(store.state.currentConfigInfo.confId).toBe('page-b');
    expect(shownSection()).toBe('Page B Section');
  });

  it('ignores a failed load the user has already moved on from', async () => {
    visit('/home/page-a', { page: 'page-a' });
    visit('/');
    visit('/home/page-a', { page: 'page-a' });
    expect(fetches.length).toBe(2);
    fetches[1].settled = true;
    fetches[1].resolve({ data: pageFile('Page A') });
    await flushPromises();
    await settle('/page-a.yml', false);
    expect(store.state.criticalError).toBeNull();
    expect(store.state.currentConfigInfo.confId).toBe('page-a');
    expect(shownSection()).toBe('Page A Section');
  });

  it('still reports a failed load for the page being opened', async () => {
    visit('/home/page-a', { page: 'page-a' });
    await settle('/page-a.yml', false);
    expect(store.state.criticalError).toContain('/page-a.yml');
  });

  it('does not reload a page that is already showing', async () => {
    visit('/home/page-a', { page: 'page-a' });
    await settle('/page-a.yml');
    visit('/home/page-a/page-a-section', { page: 'page-a', section: 'page-a-section' });
    expect(fetches.length).toBe(1);
    expect(shownSection()).toBe('Page A Section');
  });
});
