<template>
  <div v-if="account" ref="root" class="account-menu" @keydown.esc.stop="close(true)">
    <button ref="trigger" class="account-trigger" type="button"
      :aria-expanded="open" aria-controls="header-account-panel"
      @click="toggle" @keydown.down.prevent="openAndFocus">
      <span class="account-name">{{ account.name || $t('account-menu.guest') }}</span>
      <span class="account-status">{{ $t(account.loggedIn
        ? 'account-menu.signed-in' : 'account-menu.signed-out') }}</span>
      <span v-if="account.admin" class="account-role">{{ $t('account-menu.admin') }}</span>
      <span aria-hidden="true">▾</span>
    </button>
    <div v-if="open" id="header-account-panel" ref="panel" class="account-panel">
      <p class="account-full-name">{{ account.name || $t('account-menu.guest') }}</p>
      <p v-if="account.loggedIn && isSso" class="account-note">{{ $t('account-menu.sso-logout-note') }}</p>
      <AuthButtons :user-type="account.userType" :button-tab-index="0" :show-greeting="false" />
    </div>
  </div>
</template>

<script>
import AuthButtons from '@/components/Settings/AuthButtons.vue';
import getAccountState from '@/utils/auth/AccountState';

export default {
  name: 'AccountMenu',
  components: { AuthButtons },
  data: () => ({ open: false, account: null }),
  computed: {
    auth() { return this.$store.getters.appConfig.auth || {}; },
    authRevision() { return this.$store.state.authRevision; },
    isSso() { return this.auth.enableOidc || this.auth.enableKeycloak; },
  },
  watch: {
    auth: { handler: 'refresh', deep: true },
    authRevision: 'refresh',
    '$route.fullPath': 'refresh',
  },
  mounted() {
    this.refresh();
    window.addEventListener('storage', this.refresh);
    window.addEventListener('focus', this.refresh);
    document.addEventListener('visibilitychange', this.refresh);
    document.addEventListener('pointerdown', this.onOutside);
    document.addEventListener('focusin', this.onOutside);
    // Cookies can expire without a storage event. This only reads local state;
    // it never sends requests to an identity provider.
    this.expiryCheck = window.setInterval(this.refresh, 15000);
  },
  beforeUnmount() {
    window.clearInterval(this.expiryCheck);
    window.removeEventListener('storage', this.refresh);
    window.removeEventListener('focus', this.refresh);
    document.removeEventListener('visibilitychange', this.refresh);
    document.removeEventListener('pointerdown', this.onOutside);
    document.removeEventListener('focusin', this.onOutside);
  },
  methods: {
    refresh() {
      const next = getAccountState(this.auth);
      if (this.account?.name !== next?.name || this.account?.loggedIn !== next?.loggedIn) {
        this.close(false);
      }
      this.account = next;
    },
    toggle() {
      this.refresh();
      this.open = !this.open;
    },
    openAndFocus() {
      this.refresh();
      this.open = true;
      this.$nextTick(() => this.$refs.panel?.querySelector('button')?.focus());
    },
    close(returnFocus = false) {
      this.open = false;
      if (returnFocus) this.$refs.trigger?.focus();
    },
    onOutside(event) {
      if (!this.$refs.root?.contains(event.target)) this.close(false);
    },
  },
};
</script>

<style scoped lang="scss">
.account-menu {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  color: var(--nav-link-text-color);
}
.account-trigger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.75rem 0.5rem;
  font: inherit;
  color: var(--nav-link-text-color);
  background: var(--nav-link-background-color);
  border: 1px solid var(--nav-link-border-color);
  border-radius: var(--curve-factor);
  box-shadow: var(--nav-link-shadow);
  cursor: pointer;
  &:hover, &[aria-expanded="true"] {
    color: var(--nav-link-text-color-hover);
    background: var(--nav-link-background-color-hover);
    border-color: var(--nav-link-border-color-hover);
    box-shadow: var(--nav-link-shadow-hover);
  }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.account-name {
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account-status, .account-role { font-size: 0.8em; }
.account-role { font-weight: bold; }
.account-panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  z-index: 10;
  width: 18rem;
  max-width: calc(100vw - 2rem);
  box-sizing: border-box;
  padding: 0.75rem;
  color: var(--settings-text-color);
  background: var(--background);
  border: 1px solid var(--primary);
  border-radius: var(--curve-factor);
  overflow-wrap: anywhere;
}
.account-full-name { margin: 0 0 0.5rem; }
.account-note { font-size: 0.8rem; margin: 0 0 0.75rem; }
</style>
