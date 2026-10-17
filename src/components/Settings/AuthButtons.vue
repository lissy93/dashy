<template>
  <IconLogout
    v-if="iconOnly && authLabel"
    @click="run"
    v-tooltip="tooltip($t(authLabel))"
    tabindex="-2"
  />
  <div v-else-if="authLabel" class="auth-buttons">
    <span v-if="showGreeting && greeting" class="user-type-note">{{ greeting }}</span>
    <span v-else-if="showGreeting && isGuest" class="user-type-note">{{ $t('settings.please-login') }}</span>
    <button
      type="button"
      class="auth-btn"
      @click="run"
      v-tooltip="tooltip($t(authLabel))"
      :tabindex="buttonTabIndex"
    >
      <IconLogout />
      <span>{{ $t(authLabel) }}</span>
    </button>
  </div>
</template>

<script>
import router from '@/router';
import Keys from '@/utils/StoreMutations';
import { logout as registerLogout, getLogoutRedirectUrl } from '@/utils/auth/Auth';
import { getKeycloakAuth, isKeycloakEnabled } from '@/utils/auth/KeycloakAuth';
import { getOidcAuth, isOidcEnabled, oidcSignIn } from '@/utils/auth/OidcAuth';
import { localStorageKeys, userStateEnum } from '@/utils/config/defaults';
import IconLogout from '@/assets/interface-icons/user-logout.svg';

const SIGN_OUT_STATES = [
  userStateEnum.loggedIn,
  userStateEnum.keycloakEnabled,
  userStateEnum.oidcEnabled,
];

export default {
  name: 'AuthButtons',
  components: { IconLogout },
  props: {
    userType: { type: Number, required: true },
    buttonTabIndex: { type: Number, default: -2 },
    showGreeting: { type: Boolean, default: true },
    iconOnly: Boolean, // If true, render just the icon (used by ConfigLauncher)
  },
  computed: {
    authLabel() {
      if (SIGN_OUT_STATES.includes(this.userType)) return 'settings.sign-out-tooltip';
      if (this.userType === userStateEnum.guestAccess) return 'settings.sign-in-tooltip';
      return null;
    },
    greeting() {
      if (!SIGN_OUT_STATES.includes(this.userType)) return '';
      const username = localStorage[localStorageKeys.USERNAME];
      return username ? this.$t('settings.sign-in-welcome', { username }) : '';
    },
    isGuest() {
      return this.userType === userStateEnum.guestAccess;
    },
  },
  methods: {
    run() {
      switch (this.userType) {
        case userStateEnum.loggedIn: return this.logout();
        case userStateEnum.keycloakEnabled: return this.keycloakLogout();
        case userStateEnum.oidcEnabled: return this.oidcLogout();
        case userStateEnum.guestAccess: return this.goToLogin();
        default: return null;
      }
    },
    logout() {
      registerLogout();
      this.$store.commit(Keys.AUTH_CHANGED);
      this.$toast(this.$t('login.logout-message'));
      const redirectUrl = getLogoutRedirectUrl();
      setTimeout(() => {
        if (redirectUrl) window.location.href = redirectUrl;
        else router.push({ path: '/login' });
      }, 500);
    },
    keycloakLogout() {
      const keycloak = getKeycloakAuth();
      this.$toast(this.$t('login.logout-message'));
      setTimeout(() => keycloak.logout(), 500);
    },
    oidcLogout() {
      const oidc = getOidcAuth();
      this.$toast(this.$t('login.logout-message'));
      setTimeout(() => oidc.logout(), 500);
    },
    goToLogin() {
      if (isOidcEnabled()) {
        oidcSignIn();
      } else if (isKeycloakEnabled()) {
        const kc = getKeycloakAuth();
        kc.keycloakClient.login(kc.loginOptions);
      } else {
        router.push({ path: '/login' });
      }
    },
    tooltip(content) { return { content }; },
  },
};
</script>

<style scoped lang="scss">
.auth-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.user-type-note {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  color: var(--settings-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 1.75rem;
  padding: 0 0.5rem;
  background: var(--background);
  color: var(--settings-text-color);
  border: 1px solid currentColor;
  border-radius: var(--curve-factor);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  svg { width: 1rem; height: 1rem; fill: currentColor; flex-shrink: 0; }

  &:hover, &:focus-visible {
    background: var(--settings-text-color);
    color: var(--background);
    outline: none;
  }
}
</style>
