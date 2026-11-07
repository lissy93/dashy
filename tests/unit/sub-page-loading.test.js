import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import '@/utils/config/ConfigHelpers'; // Must load before the store (import cycle)
import HomeMixin from '@/mixins/HomeMixin';
import store from '@/store';
import Keys from '@/utils/StoreMutations';

/* Each sub-config fetch stays pending until the test settles it */
const fetches = [];
vi.mock('@/utils/request', () => ({
  default: {
    get: (url) => new Promise((resolve, reject) => fetches.push({ url, resolve, reject })),
  },
}));

/* Settle the nth fetch, with a section named after its URL, or as a failure */
const settle = async (n, ok = true) => {
  const { url, resolve, reject } = fetches[n];
  if (ok) resolve({ data: `sections: [{ name: ${url} }]` });
  else reject(new Error('Network Error'));
  await flushPromises();
};

/* Same as the Home, Minimal and Workspace views do on each route change */
const visit = (page) => HomeMixin.methods.loadUpConfig.call({
  ...HomeMixin.methods, $store: store, $route: { path: '/', params: { page } },
});
const shownSection = () => store.state.config.sections[0].name;

describe('Sub-page config loading', () => {
  beforeEach(async () => {
    fetches.length = 0;
    store.commit(Keys.SET_ROOT_CONFIG, {
      sections: [{ name: 'root' }],
      pages: [{ name: 'a', path: 'a.yml' }, { name: 'b', path: 'b.yml' }],
    });
    await store.dispatch(Keys.INITIALIZE_CONFIG);
  });

  it('keeps the root page when going back before a sub-page has loaded', async () => {
    visit('a');
    visit();
    await settle(0);
    expect(shownSection()).toBe('root');
  });

  it('shows the newest page when an earlier sub-page loads last', async () => {
    visit('a');
    visit('b');
    await settle(1);
    await settle(0);
    expect(shownSection()).toBe('/b.yml');
  });

  it('ignores a failed load the user has already moved on from', async () => {
    visit('a');
    visit();
    visit('a');
    await settle(1);
    await settle(0, false);
    expect(shownSection()).toBe('/a.yml');
    expect(store.state.criticalError).toBeNull();
  });
});
