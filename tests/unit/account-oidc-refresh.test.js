import { beforeEach, expect, it, vi } from 'vitest';
import { localStorageKeys } from '@/utils/config/defaults';
const fixture = vi.hoisted(() => ({ loaded: null, commit: vi.fn() }));
vi.mock('@/utils/config/ConfigAccumalator', () => ({ default: class {
  appConfig() { return { auth: { enableGuestAccess: true, oidc: { clientId: 'fixture', endpoint: 'https://idp.example', adminGroup: 'dashboard-admins' } } }; }
} }));
vi.mock('@/store', () => ({ default: { commit: fixture.commit } }));
vi.mock('@/utils/i18n', () => ({ default: { global: { t: key => key } } }));
vi.mock('@/utils/Toast', () => ({ toast: vi.fn() }));
vi.mock('@/utils/logging/CoolConsole', () => ({ statusMsg: vi.fn(), statusErrorMsg: vi.fn() }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));
vi.mock('oidc-client-ts', () => ({
  WebStorageStateStore: class {},
  Log: { setLogger: vi.fn(), setLevel: vi.fn() },
  UserManager: class {
    events = { addSilentRenewError() {}, addUserSignedOut() {}, addUserLoaded(fn) { fixture.loaded = fn; } };
    getUser() { return Promise.resolve(null); }
  },
}));
import { initOidcAuth } from '@/utils/auth/OidcAuth';
beforeEach(() => { fixture.commit.mockClear(); localStorage.setItem.mockClear(); localStorage.getItem.mockReturnValue(null); });
it('updates displayed identity and role on native silent-renew events', async () => {
  await initOidcAuth();
  fixture.loaded({ id_token: 'fixture-only', profile: { preferred_username: 'alice', groups: ['dashboard-admins'] } });
  expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USERNAME, 'alice');
  expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ISADMIN, true);
  expect(fixture.commit).toHaveBeenCalled();
  fixture.loaded({ id_token: 'new-fixture-only', profile: { preferred_username: 'alice-renamed', groups: [] } });
  expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USERNAME, 'alice-renamed');
  expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ISADMIN, false);
});
