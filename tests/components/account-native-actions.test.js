import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthButtons from '@/components/Settings/AuthButtons.vue';
import { userStateEnum } from '@/utils/config/defaults';
const actions = vi.hoisted(() => ({ oidc: false, keycloak: false, login: vi.fn(), logout: vi.fn(), localLogout: vi.fn(), push: vi.fn(), commit: vi.fn() }));
vi.mock('@/router', () => ({ default: { push: actions.push } }));
vi.mock('@/utils/auth/Auth', () => ({ logout: actions.localLogout, getLogoutRedirectUrl: () => null }));
vi.mock('@/utils/auth/OidcAuth', () => ({ isOidcEnabled: () => actions.oidc, oidcSignIn: actions.login, getOidcAuth: () => ({ logout: actions.logout }) }));
vi.mock('@/utils/auth/KeycloakAuth', () => ({ isKeycloakEnabled: () => actions.keycloak, getKeycloakAuth: () => ({ logout: actions.logout, keycloakClient: { login: actions.login } }) }));
vi.mock('@/assets/interface-icons/user-logout.svg', () => ({ default: { template: '<span />' } }));
let wrapper;
function setup(userType) {
  wrapper = mount(AuthButtons, { props: { userType, buttonTabIndex: 0, showGreeting: false }, global: {
    mocks: { $t: key => key, $toast: vi.fn(), $store: { commit: actions.commit } }, directives: { tooltip: {} },
  } });
}
beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); actions.oidc = false; actions.keycloak = false; });
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); });
describe('header reuses native account actions', () => {
  it.each(['oidc', 'keycloak'])('guest login uses native %s action', async mode => {
    actions[mode] = true; setup(userStateEnum.guestAccess);
    await wrapper.find('button').trigger('click'); expect(actions.login).toHaveBeenCalled();
  });
  it.each([userStateEnum.oidcEnabled, userStateEnum.keycloakEnabled])('SSO logout uses provider logout for state %i', async state => {
    setup(state); await wrapper.find('button').trigger('click');
    await vi.advanceTimersByTimeAsync(500); expect(actions.logout).toHaveBeenCalledOnce();
  });
  it('local logout invokes native logout, auth notification and login navigation', async () => {
    setup(userStateEnum.loggedIn); await wrapper.find('button').trigger('click');
    expect(actions.localLogout).toHaveBeenCalledOnce(); expect(actions.commit).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(500); expect(actions.push).toHaveBeenCalledWith({ path: '/login' });
  });
});
