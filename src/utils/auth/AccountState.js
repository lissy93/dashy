import { getCurrentUser, getUserState, isUserAdmin } from '@/utils/auth/Auth';
import { userStateEnum } from '@/utils/config/defaults';

/** Display-only snapshot. Server authorization never depends on this value. */
export default function getAccountState(auth = {}) {
  const configured = Boolean(auth.enableOidc || auth.enableKeycloak
    || auth.enableHeaderAuth || auth.users?.length);
  if (!configured) return null;
  const user = getCurrentUser();
  if (!user) {
    return { name: '', loggedIn: false, admin: false, userType: userStateEnum.guestAccess };
  }
  return {
    name: user.user,
    loggedIn: true,
    admin: isUserAdmin(),
    userType: getUserState(),
  };
}
