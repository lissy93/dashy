import { beforeEach, describe, expect, it, vi } from 'vitest';
import sha256 from 'crypto-js/sha256';
import getAccountState from '@/utils/auth/AccountState';
import { login, logout } from '@/utils/auth/Auth';
import { localStorageKeys, cookieKeys, userStateEnum } from '@/utils/config/defaults';
const configuration = vi.hoisted(() => ({ app: {} }));
vi.mock('@/utils/config/ConfigAccumalator', () => ({ default: class {
  appConfig() { return configuration.app; }
} }));
vi.mock('@/utils/auth/OidcAuth', () => ({ isOidcEnabled: () => Boolean(configuration.app.auth?.enableOidc) }));
vi.mock('@/utils/auth/KeycloakAuth', () => ({ isKeycloakEnabled: () => Boolean(configuration.app.auth?.enableKeycloak) }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));
const jwt = exp => `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify({ exp }))}.fixture`;
beforeEach(() => {
  configuration.app = {};
  document.cookie = `${cookieKeys.AUTH_TOKEN}=; Path=/; Max-Age=0`;
  for (const key of Object.values(localStorageKeys)) delete localStorage[key];
  localStorage.getItem.mockImplementation(key => localStorage[key] || null);
  localStorage.setItem.mockImplementation((key, value) => { localStorage[key] = String(value); });
  localStorage.removeItem.mockImplementation(key => { delete localStorage[key]; });
});
describe('account menu with native auth decisions', () => {
  it('uses a real built-in cookie and never retains the name after logout', () => {
    configuration.app.auth = { users: [{ user: 'alice', hash: sha256('fixture').toString(), type: 'admin' }] };
    login('alice', 'fixture', 60000);
    expect(getAccountState(configuration.app.auth)).toEqual({
      name: 'alice', loggedIn: true, admin: true, userType: userStateEnum.loggedIn,
    });
    logout();
    expect(getAccountState(configuration.app.auth)).toMatchObject({ loggedIn: false, admin: false, name: '' });
  });
  it.each(['enableOidc', 'enableKeycloak'])('uses native token expiry and role state for %s', mode => {
    configuration.app.auth = { [mode]: true };
    localStorage[localStorageKeys.USERNAME] = 'sso-example';
    localStorage[localStorageKeys.ISADMIN] = 'true';
    localStorage[localStorageKeys.ID_TOKEN] = jwt(Math.floor(Date.now() / 1000) + 60);
    expect(getAccountState(configuration.app.auth)).toMatchObject({ loggedIn: true, admin: true });
    localStorage[localStorageKeys.ISADMIN] = 'false';
    expect(getAccountState(configuration.app.auth).admin).toBe(false);
    localStorage[localStorageKeys.ID_TOKEN] = jwt(Math.floor(Date.now() / 1000) - 31);
    expect(getAccountState(configuration.app.auth)).toMatchObject({ loggedIn: false, admin: false, name: '' });
  });
  it('header-auth users follow the existing mapped built-in account and cookie', () => {
    configuration.app.auth = { enableHeaderAuth: true, users: [{ user: 'proxy-user', hash: sha256('fixture').toString(), type: 'normal' }] };
    login('proxy-user', 'fixture', 60000);
    expect(getAccountState(configuration.app.auth)).toMatchObject({ name: 'proxy-user', loggedIn: true, admin: false });
  });
});
