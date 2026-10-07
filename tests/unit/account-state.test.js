import { beforeEach, describe, expect, it, vi } from 'vitest';
import getAccountState from '@/utils/auth/AccountState';
import { getCurrentUser, getUserState, isUserAdmin } from '@/utils/auth/Auth';
import { userStateEnum } from '@/utils/config/defaults';

vi.mock('@/utils/auth/Auth', () => ({
  getCurrentUser: vi.fn(), getUserState: vi.fn(), isUserAdmin: vi.fn(),
}));
beforeEach(() => vi.resetAllMocks());
describe('header account presentation', () => {
  it('does not claim admin identity when authentication is absent', () => {
    isUserAdmin.mockReturnValue(true);
    expect(getAccountState()).toBeNull();
    expect(isUserAdmin).not.toHaveBeenCalled();
  });
  it.each(['enableOidc', 'enableKeycloak', 'enableHeaderAuth'])('hides stale identity for %s', mode => {
    getCurrentUser.mockReturnValue(false);
    isUserAdmin.mockReturnValue(true);
    expect(getAccountState({ [mode]: true })).toEqual({
      name: '', loggedIn: false, admin: false, userType: userStateEnum.guestAccess,
    });
  });
  it('uses native account and admin decisions for a signed-in user', () => {
    getCurrentUser.mockReturnValue({ user: 'Example User' });
    getUserState.mockReturnValue(userStateEnum.loggedIn);
    isUserAdmin.mockReturnValue(false);
    expect(getAccountState({ users: [{ user: 'Example User' }] })).toEqual({
      name: 'Example User', loggedIn: true, admin: false, userType: userStateEnum.loggedIn,
    });
    isUserAdmin.mockReturnValue(true);
    expect(getAccountState({ enableOidc: true }).admin).toBe(true);
  });
});
