import ConfigAccumulator from '@/utils/config/ConfigAccumalator';
import { localStorageKeys, routePaths } from '@/utils/config/defaults';
import ErrorHandler from '@/utils/logging/ErrorHandler';
import { statusMsg, statusErrorMsg } from '@/utils/logging/CoolConsole';
import getApiAuthHeader, { getApiAuthState } from '@/utils/auth/getApiAuthHeader';
import i18n from '@/utils/i18n';
import { toast } from '@/utils/Toast';
import $store from '@/store';
import Keys from '@/utils/StoreMutations';

// Session storage config for storing last sign-in attempt
const SIGNIN_GUARD_KEY = 'dashy.oidc.signin-attempt';
const SIGNIN_GUARD_THRESHOLD_MS = 5 * 1000;

// Guard so a silently-refreshed but still-rejected token can't reload in a loop
const SILENT_RENEW_GUARD_KEY = 'dashy.oidc.silent-attempt';
const SILENT_RENEW_GUARD_THRESHOLD_MS = 30 * 1000;
const recentlySilentRenewed = () => {
  try {
    const last = Number(sessionStorage.getItem(SILENT_RENEW_GUARD_KEY)) || 0;
    return Date.now() - last < SILENT_RENEW_GUARD_THRESHOLD_MS;
  } catch { return false; }
};
const markSilentRenewAttempt = () => {
  try { sessionStorage.setItem(SILENT_RENEW_GUARD_KEY, String(Date.now())); } catch { /* ignore */ }
};


/* Returns path to navigate back to after IdP (same-origin, not /login page) */
const safeReturnTo = (raw) => {
  if (typeof raw !== 'string') return '/';
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin || u.pathname === routePaths.login) return '/';
    return u.pathname + u.search + u.hash;
  } catch {
    return '/';
  }
};

const getAppConfig = () => {
  const Accumulator = new ConfigAccumulator();
  return Accumulator.appConfig() || {};
};

const isOidcGuestAccessEnabled = () => {
  const { auth } = getAppConfig();
  return auth && auth.enableGuestAccess;
};

/* True when Dashy's own login page should be shown, instead of jumping to the IdP */
export const isOidcLoginPageEnabled = () => {
  const { auth } = getAppConfig();
  return Boolean(auth?.oidc?.showLoginPage);
};

class OidcAuth {
  constructor(UserManager, WebStorageStateStore) {
    const { auth } = getAppConfig();
    if (!auth?.oidc?.endpoint || !auth?.oidc?.clientId) {
      throw new Error('OIDC is enabled but not correctly configured, please check the docs');
    }
    const {
      clientId,
      endpoint,
      scope,
      adminGroup,
      adminRole,
      enableSilentRenew,
      postLogoutRedirectUri,
    } = auth.oidc;
    if (typeof clientId === 'number' && !Number.isSafeInteger(clientId)) {
      ErrorHandler(
        'Your OIDC appears invalid. ',
        'You passed it as a number, and it is too long to be parsed without loosing precision. '
        + 'Wrap it in quotes in your conf.yml (e.g. clientId: "12345") to force it be a string.',
      );
    }
    const baseScope = scope || 'openid profile email roles groups';
    // Get refresh token (needed for silent renewal)
    const requestedScope = enableSilentRenew && !baseScope.split(' ').includes('offline_access')
      ? `${baseScope} offline_access`
      : baseScope;
    const settings = {
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      authority: endpoint,
      client_id: String(clientId),
      redirect_uri: `${window.location.origin}`,
      post_logout_redirect_uri: postLogoutRedirectUri,
      response_type: 'code',
      scope: requestedScope,
      response_mode: 'query',
      filterProtocolClaims: true,
      loadUserInfo: true,
    };

    this.silentRenewEnabled = Boolean(enableSilentRenew);
    this.adminGroup = adminGroup;
    this.adminRole = adminRole;
    this.userManager = new UserManager(settings);

    // Surface OIDC errors that fire outside the init promise chain
    this.userManager.events.addSilentRenewError((err) => {
      ErrorHandler('OIDC silent token renew failed', err);
    });
    this.userManager.events.addUserSignedOut(() => {
      statusMsg('OIDC', 'User signed out at provider');
    });
    // Mirror token renewals into localStorage so Bearer attachment stays fresh
    this.userManager.events.addUserLoaded((user) => {
      if (user?.id_token) this.persistUserInfo(user);
    });
  }

  /* Returns true when a same-page reload is scheduled, signalling the caller
   * to skip mounting the throwaway frame the reload would immediately discard. */
  async login() {
    const hadValidToken = Boolean(getApiAuthHeader());
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const providerError = url.searchParams.get('error');

    // Provider redirected back with an error
    if (providerError && !code) {
      const desc = url.searchParams.get('error_description') || '';
      throw new Error(`OIDC provider returned ${providerError}: ${desc}`);
    }

    if (code) {
      // Populate localStorage before the reload so the post-reload route guard
      // sees the user as logged-in and lets them through to /, not /login.
      const callbackUser = await this.userManager.signinCallback(window.location.href);
      if (!callbackUser) {
        throw new Error(
          'OIDC signinCallback returned no user. Check userinfo CORS, '
          + 'requested scopes, and that id_token claims include a username.',
        );
      }
      this.persistUserInfo(callbackUser);
      const returnTo = safeReturnTo(callbackUser.state);
      toast(i18n.global.t('login.authenticated-redirecting'), { type: 'success' });
      setTimeout(() => window.location.replace(returnTo), 600);
      return true;
    }

    const user = await this.userManager.getUser();
    if (user === null) {
      if (isOidcGuestAccessEnabled() || isOidcLoginPageEnabled()) return false;
      await this.redirectToIdp();
      return true;
    }

    // Server returned an unauthenticated bootstrap config
    // Cached id_token is expired / invalid, wipe it and re-authenticate
    // Try a quiet refresh, else redirect user to their login form
    if ($store.state.rootConfig?._bootstrap?.authenticated === false) {
      if (this.silentRenewEnabled && user.refresh_token
        && !recentlySilentRenewed() && await this.trySilentRenew()) {
        markSilentRenewAttempt();
        setTimeout(() => window.location.reload(), 250);
        return true;
      }
      // But if the token is still good, so we don't refuse it
      if (getApiAuthState().ok) {
        throw new Error(
          'OIDC login succeeded, but Dashy still received unauthenticated config. '
          + 'Check server logs, proxy Authorization headers, and stale service worker/cache state.',
        );
      }
      await this.userManager.removeUser();
      localStorage.removeItem(localStorageKeys.ID_TOKEN);
      await this.redirectToIdp();
      return true;
    }

    this.persistUserInfo(user);
    // Fresh token established this run: reload to refetch config with Bearer
    if (!hadValidToken && getApiAuthHeader()) {
      toast(i18n.global.t('login.authenticated-redirecting'), { type: 'success' });
      setTimeout(() => window.location.reload(), 500);
      return true;
    }
    // Keep token fresh in the background, once session is valid
    this.startBackgroundRenew(user);
    return false;
  }

  /* Attempts to renew session with refresh token
   * returns true on success, or false to trigger redirect to login page */
  async trySilentRenew() {
    try {
      const previousToken = localStorage.getItem(localStorageKeys.ID_TOKEN);
      const user = await this.userManager.signinSilent();
      if (user?.id_token && user.id_token !== previousToken) {
        this.persistUserInfo(user);
        return true;
      }
      ErrorHandler('OIDC silent renewal completed but no fresh id_token was issued; '
        + 'your provider may not reissue id_tokens on refresh.');
    } catch (err) {
      ErrorHandler('OIDC silent token renewal failed, using interactive sign-in', err);
    }
    return false;
  }

  /* Called from request.js if we get a 401 back */
  async renewForApiRequest() {
    if (!this.silentRenewEnabled) {
      statusErrorMsg('OIDC', 'API request needs a fresh token, but silent renewal is disabled');
      return false;
    }
    const user = await this.userManager.getUser().catch(() => null);
    if (!user) {
      statusErrorMsg('OIDC', 'No active session to renew; sign in again.');
      return false;
    }
    if (!user.refresh_token) {
      statusErrorMsg(
        'OIDC',
        'API request needs a fresh token, but none is available. '
        + 'If this persists, ensure offline_access is granted, then sign in again.',
      );
      return false;
    }
    return this.trySilentRenew();
  }

  /* Start OIDC background renewal for confirmed sessions if enabled */
  startBackgroundRenew(user) {
    if (this.silentRenewEnabled && user?.refresh_token) this.userManager.startSilentRenew();
  }


  /* Redirects to IdP for signin. Bail on failed retry to prevent infinite redirect loop */
  async redirectToIdp(userInitiated = false) {
    const lastAttempt = Number(sessionStorage.getItem(SIGNIN_GUARD_KEY)) || 0;
    if (!userInitiated && Date.now() - lastAttempt < SIGNIN_GUARD_THRESHOLD_MS) {
      sessionStorage.removeItem(SIGNIN_GUARD_KEY);
      throw new Error(
        'OIDC sign-in redirect loop detected. Check provider redirect URIs '
        + 'and that id_token claims include a username.',
      );
    }
    sessionStorage.setItem(SIGNIN_GUARD_KEY, String(Date.now()));
    const returnTo = window.location.pathname + window.location.search + window.location.hash;
    await this.userManager.signinRedirect({ state: returnTo });
  }

  /* Mirror the OIDC user into the localStorage keys other parts of Dashy read */
  persistUserInfo(user) {
    const { roles = [] } = user.profile;
    // GitLab puts groups in `groups_direct`, so merge both claim names
    const groups = [...new Set(
      [user.profile.groups, user.profile.groups_direct].filter(Array.isArray).flat(),
    )];
    const info = { groups, roles };
    const isAdmin = (Array.isArray(groups) && groups.includes(this.adminGroup))
      || (Array.isArray(roles) && roles.includes(this.adminRole))
      || false;
    // Fall back through username candidates so USERNAME is always a non-empty
    const username = user.profile.preferred_username
      || user.profile.email
      || user.profile.sub
      || 'oidc-user';
    statusMsg(`Authenticated as ${username} ${isAdmin ? '(admin)' : '(non-admin)'}`, JSON.stringify(info));
    localStorage.setItem(localStorageKeys.KEYCLOAK_INFO, JSON.stringify(info));
    localStorage.setItem(localStorageKeys.USERNAME, username);
    localStorage.setItem(localStorageKeys.ISADMIN, isAdmin);
    if (user.id_token) localStorage.setItem(localStorageKeys.ID_TOKEN, user.id_token);
    sessionStorage.removeItem(SIGNIN_GUARD_KEY);
    $store.commit(Keys.AUTH_CHANGED);
  }

  async logout() {
    this.userManager.stopSilentRenew();
    localStorage.removeItem(localStorageKeys.USERNAME);
    localStorage.removeItem(localStorageKeys.KEYCLOAK_INFO);
    localStorage.removeItem(localStorageKeys.ISADMIN);
    localStorage.removeItem(localStorageKeys.ID_TOKEN);

    $store.commit(Keys.AUTH_CHANGED);
    try {
      await this.userManager.signoutRedirect();
    } catch (reason) {
      ErrorHandler('OIDC logout failed, redirecting to provider instead', reason);
      window.location.href = this.userManager.settings.authority;
    }
  }
}

export const isOidcEnabled = () => {
  const { auth } = getAppConfig();
  if (!auth) return false;
  return auth.enableOidc || false;
};

let oidc;

export const initOidcAuth = async () => {
  const { UserManager, WebStorageStateStore, Log } = await import('oidc-client-ts');
  if (import.meta.env.DEV) {
    Log.setLogger(console);
    Log.setLevel(Log.INFO);
  }
  oidc = new OidcAuth(UserManager, WebStorageStateStore);
  return oidc.login();
};

export const getOidcAuth = () => {
  if (!oidc) {
    ErrorHandler("OIDC not initialized, can't get instance of class");
  }
  return oidc;
};

/* Sends the user off to the IdP, for an interactive sign-in */
export const oidcSignIn = () => getOidcAuth().redirectToIdp(true);
