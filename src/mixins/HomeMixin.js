/**
 * Mixin for all homepages (default home, minimal home, workspace, etc)
 */

import Defaults, { localStorageKeys, iconCdns } from '@/utils/config/defaults';
import Keys from '@/utils/StoreMutations';
import { searchTiles } from '@/utils/Search';
import { getCurrentUser, isLoggedInAsGuest } from '@/utils/auth/Auth';
import { isVisibleToUser } from '@/utils/IsVisibleToUser';
import { resolveRouteIntent, PAGE_STATUS } from '@/utils/config/ConfigHelpers';

const HomeMixin = {
  computed: {
    sections() {
      return this.$store.getters.sections;
    },
    appConfig() {
      return this.$store.getters.appConfig;
    },
    pageInfo() {
      return this.$store.getters.pageInfo;
    },
    isEditMode() {
      return this.$store.state.editMode;
    },
    modalOpen() {
      return this.$store.state.modalOpen;
    },
    pageId() {
      return this.$store.state.currentConfigInfo?.confId || 'home';
    },
    /* True when the server returned a stripped bootstrap config (e.g. expired token) */
    isBootstrap() {
      return this.$store.state.rootConfig?._bootstrap?.authenticated === false;
    },
  },
  data: () => ({
    searchValue: '',
  }),
  watch: {
    async $route() {
      this.loadUpConfig();
    },
  },
  async created() {
    this.loadUpConfig();
  },
  methods: {
    /* Reload to restart the auth flow, when OIDC/Keycloak get bootstrap marker */
    reAuth() {
      window.location.reload();
    },
    /* When page loaded / sub-page changed, initiate config fetch.
     * For ROOT / LEGACY_SECTION intent the store loads the root config
     * for KNOWN the store loads the matching sub-config
     * for UNKNOWN the store triggers the critical error modal */
    async loadUpConfig() {
      const subPage = this.determineConfigFile();
      const current = this.$store.state.currentConfigInfo?.confId || null;
      const requested = this.$store.state.requestedConfigId;
      // Already on this config, and it's the last one requested, so no reload
      if ((subPage || null) === current && current === requested) return;
      await this.$store.dispatch(Keys.INITIALIZE_CONFIG, subPage);
    },
    /* Resolve which sub-config the current route targets.
     * Returns a page id from makePageName, or null for the root config */
    determineConfigFile() {
      const { status, pageId } = resolveRouteIntent(this.$route, this.$store);
      if (status === PAGE_STATUS.ROOT || status === PAGE_STATUS.LEGACY_SECTION) return null;
      return pageId; // KNOWN -> load sub-config; UNKNOWN -> store raises critical error
    },
    updateModalVisibility(modalState) {
      this.$store.commit(Keys.SET_MODAL_OPEN, modalState);
    },
    /* Updates local data with search value, triggered from filter comp */
    searching(searchValue) {
      this.searchValue = searchValue || '';
    },
    /* Returns a unique ID based on the page and section name */
    makeSectionId(section) {
      const normalize = (str) => (
        str ? str.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, '-')
          : `unnamed-${(`000${Math.floor(Math.random() * 1000)}`).slice(-3)}`
      );
      return `${this.pageId || 'unknown-page'}-${normalize(section.name)}`;
    },
    /* Returns true if there is one or more sections in the config */
    checkTheresData(sections) {
      const localSections = localStorage[localStorageKeys.CONF_SECTIONS];
      return (sections && sections.length >= 1) || (localSections && localSections.length >= 1);
    },
    /* Returns only the tiles that match the users search query */
    filterTiles(allTiles, sectionName, opts = {}) {
      if (!allTiles) return [];
      const currentUser = getCurrentUser();
      const isGuest = isLoggedInAsGuest();
      const showHidden = !!opts.showHidden;
      const visibleTiles = allTiles.filter(
        (tile) => isVisibleToUser(tile.displayData || {}, currentUser, isGuest)
          && (showHidden || !tile.displayData?.hideFromHomepage),
      );
      return searchTiles(visibleTiles, this.searchValue, sectionName || '');
    },
    /* Checks if any sections or items use icons from a given CDN */
    checkIfIconLibraryNeeded(prefix) {
      if (!this.sections) return false;
      let isNeeded = false; // Will be set to true if prefix found in icon name
      this.sections.forEach((section) => {
        if (section && section.icon && section.icon.includes(prefix)) isNeeded = true;
        if (section && section.items) {
          section.items.forEach((item) => {
            if (item.icon && item.icon.includes(prefix)) isNeeded = true;
          });
        }
      });
      return isNeeded;
    },
    /* Checks if any of the icons are Font Awesome glyphs */
    checkIfFontAwesomeNeeded() {
      if (this.appConfig.enableFontAwesome === false) return false;
      if (this.appConfig.enableFontAwesome) return true;
      let isNeeded = this.checkIfIconLibraryNeeded('fa-');
      const currentTheme = localStorage[localStorageKeys.THEME]; // Some themes require FA
      if (['material', 'material-dark'].includes(currentTheme)) isNeeded = true;
      return isNeeded;
    },
    /* Injects font-awesome's script tag, only if needed */
    initiateFontAwesome() {
      if (this.checkIfFontAwesomeNeeded()) {
        const fontAwesomeScript = document.createElement('script');
        const faKey = this.appConfig.fontAwesomeKey || Defaults.fontAwesomeKey;
        fontAwesomeScript.setAttribute('src', `${iconCdns.fa}/${faKey}.js`);
        document.head.appendChild(fontAwesomeScript);
      }
    },
    /* Checks if any of the icons are Material Design Icons */
    checkIfMdiNeeded() {
      const userOverride = this.appConfig.enableMaterialDesignIcons;
      if (userOverride === false) return false;
      return userOverride || this.checkIfIconLibraryNeeded('mdi-');
    },
    /* Injects Material Design Icons, only if needed */
    initiateMaterialDesignIcons() {
      if (this.checkIfMdiNeeded()) {
        const mdiStylesheet = document.createElement('link');
        mdiStylesheet.setAttribute('rel', 'stylesheet');
        mdiStylesheet.setAttribute('href', iconCdns.mdi);
        document.head.appendChild(mdiStylesheet);
      }
    },
    /* Returns true if there is more than 1 sub-result visible during searching */
    checkIfResults(sections) {
      if (!sections) return false;
      else {
        let itemsFound = true;
        sections.forEach((section) => {
          if (section.widgets && section.widgets.length > 0) itemsFound = false;
          if (section.filteredItems.length > 0) itemsFound = false;
        });
        return itemsFound;
      }
    },
    /* If user has a background image, then generate CSS attributes */
    getBackgroundImage() {
      if (this.appConfig && this.appConfig.backgroundImg) {
        return `background: url('${this.appConfig.backgroundImg}') no-repeat center fixed;background-size:cover;`;
      }
      return '';
    },
  },
};

export default HomeMixin;
