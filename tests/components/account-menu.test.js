import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountMenu from '@/components/PageStrcture/AccountMenu.vue';
import getAccountState from '@/utils/auth/AccountState';
vi.mock('@/utils/auth/AccountState', () => ({ default: vi.fn() }));
vi.mock('@/components/Settings/AuthButtons.vue', () => ({ default: {
  props: ['userType', 'buttonTabIndex', 'showGreeting'],
  template: '<button :tabindex="buttonTabIndex">Native action</button>',
} }));
let wrapper;
let store;
const guest = { name: '', loggedIn: false, admin: false, userType: 2 };
const admin = { name: 'Example Administrator', loggedIn: true, admin: true, userType: 4 };
async function setup() {
  store = createStore({ state: { authRevision: 0 }, getters: { appConfig: () => ({ auth: { enableOidc: true } }) } });
  wrapper = mount(AccountMenu, { attachTo: document.body, global: {
    plugins: [store], mocks: { $t: key => key, $route: { fullPath: '/' } },
  } });
  await wrapper.vm.$nextTick();
  return wrapper;
}
beforeEach(() => { vi.useFakeTimers(); getAccountState.mockReturnValue(guest); });
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); });
describe('account disclosure', () => {
  it('displays guest without admin marker and passes keyboard-accessible native actions', async () => {
    await setup();
    expect(wrapper.text()).toContain('account-menu.guest');
    expect(wrapper.find('.account-role').exists()).toBe(false);
    await wrapper.find('.account-trigger').trigger('click');
    expect(wrapper.find('.account-panel button').attributes('tabindex')).toBe('0');
    expect(wrapper.find('.account-trigger').attributes('aria-expanded')).toBe('true');
  });
  it('moves focus using ArrowDown and returns focus with Escape', async () => {
    await setup();
    await wrapper.find('.account-trigger').trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(wrapper.find('.account-panel button').element);
    await wrapper.find('.account-panel button').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.account-panel').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.find('.account-trigger').element);
  });
  it('shows full name and SSO notice; closes on outside focus', async () => {
    getAccountState.mockReturnValue(admin); await setup();
    expect(wrapper.find('.account-role').text()).toBe('account-menu.admin');
    await wrapper.find('.account-trigger').trigger('click');
    expect(wrapper.find('.account-full-name').text()).toBe(admin.name);
    expect(wrapper.text()).toContain('account-menu.sso-logout-note');
    document.body.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.account-panel').exists()).toBe(false);
  });
  it('updates on auth events, cross-tab logout, focus, and local expiry without retaining stale admin', async () => {
    await setup();
    getAccountState.mockReturnValue(admin); store.state.authRevision += 1;
    await wrapper.vm.$nextTick(); expect(wrapper.text()).toContain(admin.name);
    getAccountState.mockReturnValue(guest); window.dispatchEvent(new Event('storage'));
    await wrapper.vm.$nextTick(); expect(wrapper.find('.account-role').exists()).toBe(false);
    getAccountState.mockReturnValue(admin); window.dispatchEvent(new Event('focus'));
    await wrapper.vm.$nextTick(); expect(wrapper.text()).toContain(admin.name);
    getAccountState.mockReturnValue(guest); await vi.advanceTimersByTimeAsync(15000);
    expect(wrapper.text()).not.toContain(admin.name);
  });
  it('renders nothing without configured identity', async () => {
    getAccountState.mockReturnValue(null); await setup(); expect(wrapper.find('button').exists()).toBe(false);
  });
});
