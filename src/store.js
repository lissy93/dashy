import { createStore } from 'vuex';
import { load as yamlLoad } from '@/utils/yaml';
import request, { readHeader } from '@/utils/request';
import Keys from '@/utils/StoreMutations';
import {
  makePageName, formatConfigPath, componentVisibility, configScope, stripRootOwnedFields,
} from '@/utils/config/ConfigHelpers';
import { applyItemId, mapSectionByName, stripItemIds } from '@/utils/config/SectionHelpers';
import filterUserSections from '@/utils/CheckSectionVisibility';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/logging/ErrorHandler';
import {
  isUserAdmin,
  makeBasicAuthHeaders,
  isLoggedInAsGuest,
  getUserState,
} from '@/utils/auth/Auth';
import { localStorageKeys, theme as defaultTheme } from '@/utils/config/defaults';

const {
  INITIALIZE_CONFIG,
  INITIALIZE_ROOT_CONFIG,
  SET_CONFIG,
  SET_CONFIG_SOURCE,
  APPLY_EDITED_CONFIG,
  SET_ROOT_CONFIG,
  SET_CURRENT_CONFIG_INFO,
  SET_CONFIG_HASH,
  SET_ROOT_CONFIG_HASH,
  SET_SAVE_CONFLICT,
  SET_IS_USING_LOCAL_CONFIG,
  SET_MODAL_OPEN,
  SET_LANGUAGE,
  SET_ITEM_LAYOUT,
  SET_ITEM_SIZE,
  SET_THEME,
  UPDATE_ITEM,
  USE_MAIN_CONFIG,
  SET_EDIT_MODE,
  SET_PAGE_INFO,
  SET_APP_CONFIG,
  SET_SECTIONS,
  SET_PAGES,
  UPDATE_SECTION,
  INSERT_SECTION,
  REMOVE_SECTION,
  COPY_ITEM,
  REMOVE_ITEM,
  INSERT_ITEM,
  INSERT_WIDGET,
  UPDATE_WIDGET,
  REMOVE_WIDGET,
  UPDATE_CUSTOM_CSS,
  CONF_MENU_INDEX,
  CRITICAL_ERROR_MSG,
  AUTH_CHANGED,
} = Keys;

const emptyConfig = {
  appConfig: {},
  pageInfo: { title: 'Dashy' },
  sections: [],
};

/* One-shot guard against reload loops when a sub-config 401 triggers re-auth.
 * Set in sessionStorage before reloading, cleared on the next successful sub-config fetch */
const SUB_CONFIG_RELOAD_KEY = 'dashy.sub-config-reload-attempt';

/* Read + JSON-parse a raw localStorage slot, returning undefined on miss/fail. */
const readLocal = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch (e) {
    ErrorHandler(`Malformed local config for '${key}'`, e);
    return undefined;
  }
};

/* Write one top-level config field to both the merged runtime view (`config`)
 * and the active page's source. Keeps the two from drifting.
 * Item/widget `id`s are runtime-only — applied to `config` for rendering,
 * kept out of `configSource` so they never land in persisted YAML. */
const commitConfigField = (state, field, value) => {
  const isSections = field === 'sections';
  state.config = { ...state.config, [field]: isSections ? applyItemId(value) : value };
  state.configSource = { ...state.configSource, [field]: isSections ? stripItemIds(value) : value };
};

/* Patch a single appConfig key. Optionally persists to a localStorage slot
 * (used by the quick-pickers; omitted for pure runtime-state updates). */
const patchAppConfigField = (state, key, value, storageKey) => {
  state.config = { ...state.config, appConfig: { ...state.config.appConfig, [key]: value } };
  state.configSource = {
    ...state.configSource,
    appConfig: { ...(state.configSource.appConfig || {}), [key]: value },
  };
  if (storageKey) localStorage.setItem(storageKey, value);
};

 /* Read locally saved configs/overrides from localStorage  */
function readLocalOverrides(subConfigId) {
  const scope = configScope(subConfigId);
  const own = {};
  let hasStructural = false;

  const localAppConfig = readLocal(scope.APP_CONFIG);
  const localPageInfo = readLocal(scope.PAGE_INFO);
  const localSections = readLocal(scope.CONF_SECTIONS);

  const appConfig = {};
  if (localAppConfig && typeof localAppConfig === 'object') {
    Object.assign(appConfig, localAppConfig);
    hasStructural = true;
  }
  // Quick-picker slots layer on top for normal local stuff
  const theme = localStorage.getItem(scope.THEME);
  const layout = localStorage.getItem(scope.LAYOUT);
  const iconSize = localStorage.getItem(scope.ICON_SIZE);
  const language = localStorage.getItem(scope.LANGUAGE);
  if (theme) appConfig.theme = theme;
  if (layout) appConfig.layout = layout;
  if (iconSize) appConfig.iconSize = iconSize;
  if (language) appConfig.language = language;
  if (Object.keys(appConfig).length) own.appConfig = appConfig;

  if (localPageInfo && typeof localPageInfo === 'object') {
    own.pageInfo = localPageInfo;
    hasStructural = true;
  }
  if (Array.isArray(localSections) && localSections.length) {
    own.sections = localSections;
    hasStructural = true;
  }
  if (!subConfigId) {
    const localPages = readLocal(localStorageKeys.CONF_PAGES);
    if (Array.isArray(localPages)) {
      own.pages = localPages;
      hasStructural = true;
    }
  }
  return { own, hasStructural };
}

/* Root config with its own local overrides layered on */
function buildRootEffective(state) {
  const root = state.rootConfig || {};
  const { own } = readLocalOverrides(null);
  return {
    appConfig: { ...(root.appConfig || {}), ...(own.appConfig || {}) },
    pageInfo: { ...(root.pageInfo || {}), ...(own.pageInfo || {}) },
    sections: own.sections || root.sections || [],
    pages: own.pages || root.pages || [],
  };
}

/* Merges root config and sub-page config */
function mergeWithRoot(root, own) {
  const rootApp = root.appConfig || {};
  const ownApp = own.appConfig || {};
  const appConfig = { ...rootApp, ...ownApp };
  if (rootApp.auth !== undefined) appConfig.auth = rootApp.auth;
  else delete appConfig.auth;
  return {
    appConfig,
    pageInfo: { ...(root.pageInfo || {}), ...(own.pageInfo || {}) },
    sections: own.sections || [],
    pages: root.pages || [],
  };
}

const store = createStore({
  state: {
    config: {}, // The current config being used, and rendered to the UI (merged runtime view)
    configSource: {}, // The current config as it appears in the file (before root merges)
    rootConfig: null, // Always the content of main config file, never used directly
    editMode: false, // While true, the user can drag and edit items + sections
    modalOpen: false, // KB shortcut functionality will be disabled when modal is open
    currentConfigInfo: {}, // For multi-page support, will store info about config file
    configHash: null, // Load-time hash of the active config, for conflict detection
    rootConfigHash: null, // Load-time hash of the root conf.yml
    saveConflict: null, // Set when a save is refused because the file changed
    isUsingLocalConfig: false, // If true, will use local config instead of fetched
    criticalError: null, // Will store a message, if a critical error occurs
    navigateConfToTab: undefined, // Used to switch active tab in config modal
    authRevision: 0, // Bumped on login/logout so auth-dependent getters re-run
  },
  getters: {
    config(state) {
      return state.config;
    },
    configSource(state) {
      return state.configSource;
    },
    isSubConfig(state) {
      return !!state.currentConfigInfo.confId;
    },
    pageInfo(state) {
      if (!state.config) return {};
      return state.config.pageInfo || {};
    },
    appConfig(state) {
      if (!state.config) return {};
      return state.config.appConfig || {};
    },
    sections(state) {
      void state.authRevision; // Re-filter sections when auth state changes
      return filterUserSections(state.config.sections || []);
    },
    pages(state) {
      return state.config.pages || [];
    },
    theme(state) {
      // Read reactive deps upfront so Vuex tracks every branch (avoids the
      // short-circuit caching bug where unread props wouldn't invalidate).
      const cfg = state.config?.appConfig;
      const configTheme = cfg?.theme;
      const dayTheme = cfg?.dayTheme;
      const nightTheme = cfg?.nightTheme;
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const fromState = (prefersDark ? nightTheme : dayTheme) || configTheme || defaultTheme;
      if (state.editMode) return fromState;
      return localStorage.getItem(configScope(state.currentConfigInfo.confId).THEME) || fromState;
    },
    webSearch(state, getters) {
      return getters.appConfig.webSearch || {};
    },
    visibleComponents(state, getters) {
      return componentVisibility(getters.appConfig);
    },
    /* Make config read/ write permissions object */
    permissions(state, getters) {
      void state.authRevision; // Re-evaluate when auth state changes
      const appConfig = getters.appConfig;
      const perms = {
        allowWriteToDisk: true,
        allowSaveLocally: true,
        allowViewConfig: true,
      };
      // Disable saving changes locally, only
      if (appConfig.preventLocalSave) {
        perms.allowSaveLocally = false;
      }
      // Disable saving changes to disk, only
      if (appConfig.preventWriteToDisk || !isUserAdmin()) {
        perms.allowWriteToDisk = false;
      }
      // Disable everything
      if (appConfig.disableConfiguration
        || (appConfig.disableConfigurationForNonAdmin && !isUserAdmin())
        || isLoggedInAsGuest()) {
        perms.allowWriteToDisk = false;
        perms.allowSaveLocally = false;
        perms.allowViewConfig = false;
      }
      return perms;
    },
    userState(state) {
      void state.authRevision; // Re-evaluate when auth state changes
      return getUserState();
    },

    getSectionByName: (state, getters) => (name) => (
      getters.sections.find((section) => (section.name || '') === name)
    ),
    /* Index is the section's position in the raw config, not the filtered view */
    getSectionByIndex: (state) => (index) => (state.config.sections || [])[index],
    getItemById: (state, getters) => (id) => {
      if (!id) return undefined;
      let item;
      getters.sections.forEach(sec => {
        if (sec.items) {
          const foundItem = sec.items.find((itm) => itm.id === id);
          if (foundItem) item = foundItem;
        }
      });
      return item;
    },
    getParentSectionOfItem: (state, getters) => (itemId) => {
      let foundSection;
      getters.sections.forEach((section) => {
        (section.items || []).forEach((item) => {
          if (item.id === itemId) foundSection = section;
        });
      });
      return foundSection;
    },
    layout(state) {
      const scope = configScope(state.currentConfigInfo.confId);
      const fromState = state.configSource?.appConfig?.layout || 'auto';
      if (state.editMode) return fromState;
      return localStorage.getItem(scope.LAYOUT) || fromState;
    },
    iconSize(state) {
      const scope = configScope(state.currentConfigInfo.confId);
      const fromState = state.configSource?.appConfig?.iconSize || 'medium';
      if (state.editMode) return fromState;
      return localStorage.getItem(scope.ICON_SIZE) || fromState;
    },
  },
  mutations: {
    /* Cache the raw root config so sub-page navigations don't re-fetch the main YAML */
    [SET_ROOT_CONFIG](state, config) {
      if (!config.appConfig) config.appConfig = {};
      state.rootConfig = config;
    },
    /* The config to display and edit. Will differ from ROOT_CONFIG when using multi-page */
    [SET_CONFIG](state, config) {
      const next = { ...(config || {}) };
      if (!next.appConfig) next.appConfig = {};
      if (next.sections) next.sections = applyItemId(next.sections);
      state.config = next;
    },
    /* The active page's own/intent config (partial for sub-pages). Editor reads this. */
    [SET_CONFIG_SOURCE](state, source) {
      state.configSource = source || {};
    },
    [SET_CURRENT_CONFIG_INFO](state, subConfigInfo) {
      state.currentConfigInfo = subConfigInfo;
    },
    [SET_CONFIG_HASH](state, hash) {
      state.configHash = hash || null;
    },
    [SET_ROOT_CONFIG_HASH](state, hash) {
      state.rootConfigHash = hash || null;
    },
    [SET_SAVE_CONFLICT](state, conflict) {
      state.saveConflict = conflict || null;
    },
    [SET_IS_USING_LOCAL_CONFIG](state, isUsingLocalConfig) {
      state.isUsingLocalConfig = isUsingLocalConfig;
    },
    [SET_LANGUAGE](state, lang) {
      patchAppConfigField(state, 'language', lang, configScope(state.currentConfigInfo.confId).LANGUAGE);
      InfoHandler('Language updated', InfoKeys.VISUAL);
    },
    [SET_MODAL_OPEN](state, modalOpen) {
      state.modalOpen = modalOpen;
    },
    [SET_EDIT_MODE](state, editMode) {
      if (editMode !== state.editMode) {
        InfoHandler(editMode ? 'Edit session started' : 'Edit session ended', InfoKeys.EDITOR);
        state.editMode = editMode;
      }
    },
    [CRITICAL_ERROR_MSG](state, message) {
      if (message) ErrorHandler(message);
      state.criticalError = message;
    },
    [SET_PAGE_INFO](state, pageInfo) {
      commitConfigField(state, 'pageInfo', pageInfo || {});
      InfoHandler('Page info updated', InfoKeys.EDITOR);
    },
    [SET_APP_CONFIG](state, appConfig) {
      commitConfigField(state, 'appConfig', appConfig || {});
      InfoHandler('App config updated', InfoKeys.EDITOR);
    },
    [SET_PAGES](state, multiPages) {
      // `pages` is always root-owned, regardless of the active page.
      const pages = Array.isArray(multiPages) ? multiPages : [];
      if (state.rootConfig) state.rootConfig = { ...state.rootConfig, pages };
      else ErrorHandler('SET_PAGES called before root config loaded; change may be lost');
      state.config = { ...state.config, pages };
      if (!state.currentConfigInfo.confId) {
        state.configSource = { ...state.configSource, pages };
      }
      InfoHandler('Pages updated', InfoKeys.EDITOR);
    },
    [SET_SECTIONS](state, sections) {
      commitConfigField(state, 'sections', sections || []);
      InfoHandler('Sections updated', InfoKeys.EDITOR);
    },
    [UPDATE_ITEM](state, { itemId, newItem }) {
      commitConfigField(state, 'sections', state.config.sections.map((section) => ({
        ...section,
        items: (section.items || []).map((item) => (item.id === itemId ? newItem : item)),
      })));
      InfoHandler('Item updated', InfoKeys.EDITOR);
    },
    [UPDATE_SECTION](state, { sectionName, sectionData }) {
      commitConfigField(state, 'sections',
        mapSectionByName(state.config.sections, sectionName, () => sectionData));
      InfoHandler('Section updated', InfoKeys.EDITOR);
    },
    [INSERT_SECTION](state, newSection) {
      commitConfigField(state, 'sections', [
        ...state.config.sections,
        { ...newSection, items: [] },
      ]);
      InfoHandler('New section added', InfoKeys.EDITOR);
    },
    [REMOVE_SECTION](state, { sectionName }) {
      const current = state.config.sections;
      if (!current.some((section) => (section.name || '') === sectionName)) return;
      commitConfigField(state, 'sections', current.filter((section) => (section.name || '') !== sectionName));
      InfoHandler('Section removed', InfoKeys.EDITOR);
    },
    [INSERT_ITEM](state, { newItem, targetSection }) {
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, targetSection,
        (s) => ({ ...s, items: [...(s.items || []), newItem] })));
      InfoHandler('New item added', InfoKeys.EDITOR);
    },
    [COPY_ITEM](state, { item, toSection, appendTo }) {
      const newItem = { ...item };
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, toSection, (s) => ({
        ...s,
        items: appendTo === 'beginning'
          ? [newItem, ...(s.items || [])]
          : [...(s.items || []), newItem],
      })));
      InfoHandler('Item copied', InfoKeys.EDITOR);
    },
    [REMOVE_ITEM](state, { itemId, sectionName }) {
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, sectionName,
        (s) => ({ ...s, items: (s.items || []).filter((item) => item.id !== itemId) })));
      InfoHandler('Item removed', InfoKeys.EDITOR);
    },
    [INSERT_WIDGET](state, { sectionName, widget }) {
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, sectionName,
        (s) => ({ ...s, widgets: [...(s.widgets || []), widget] })));
      InfoHandler('New widget added', InfoKeys.EDITOR);
    },
    [UPDATE_WIDGET](state, { sectionName, widgetIndex, widget }) {
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, sectionName, (s) => ({
        ...s,
        widgets: (s.widgets || []).map((w, wi) => (wi === widgetIndex ? widget : w)),
      })));
      InfoHandler('Widget updated', InfoKeys.EDITOR);
    },
    [REMOVE_WIDGET](state, { sectionName, widgetIndex }) {
      commitConfigField(state, 'sections', mapSectionByName(state.config.sections, sectionName,
        (s) => ({ ...s, widgets: (s.widgets || []).filter((_, wi) => wi !== widgetIndex) })));
      InfoHandler('Widget removed', InfoKeys.EDITOR);
    },
    [SET_THEME](state, theme) {
      patchAppConfigField(state, 'theme', theme, configScope(state.currentConfigInfo.confId).THEME);
      InfoHandler('Theme updated', InfoKeys.VISUAL);
    },
    [SET_ITEM_LAYOUT](state, layout) {
      patchAppConfigField(state, 'layout', layout, configScope(state.currentConfigInfo.confId).LAYOUT);
      InfoHandler('Layout updated', InfoKeys.VISUAL);
    },
    [SET_ITEM_SIZE](state, iconSize) {
      patchAppConfigField(state, 'iconSize', iconSize, configScope(state.currentConfigInfo.confId).ICON_SIZE);
      InfoHandler('Item size updated', InfoKeys.VISUAL);
    },
    [UPDATE_CUSTOM_CSS](state, customCss) {
      patchAppConfigField(state, 'customCss', customCss);
      InfoHandler('Custom CSS updated', InfoKeys.VISUAL);
    },
    [CONF_MENU_INDEX](state, index) {
      state.navigateConfToTab = index;
    },
    [AUTH_CHANGED](state) {
      state.authRevision += 1;
    },
    /* Set config to rootConfig, by calling initialize with no params */
    async [USE_MAIN_CONFIG]() {
      this.dispatch(Keys.INITIALIZE_CONFIG);
    },
  },
  actions: {
    /* Fetches the root config file, only ever called by INITIALIZE_CONFIG */
    async [INITIALIZE_ROOT_CONFIG]({ commit }) {
      const configFilePath = import.meta.env.VITE_APP_CONFIG_PATH || '/conf.yml';
      try {
        // Attempt to fetch the YAML file
        const response = await request.get(configFilePath, makeBasicAuthHeaders());
        let data;
        try {
          data = yamlLoad(response.data);
        } catch (parseError) {
          commit(CRITICAL_ERROR_MSG, `Failed to parse YAML: ${parseError.message}`);
          return { ...emptyConfig };
        }
        // Replace missing root properties with empty objects
        if (!data.appConfig) data.appConfig = {};
        if (!data.pageInfo) data.pageInfo = {};
        if (!data.sections) data.sections = [];
        // Set the state, and return data
        commit(SET_ROOT_CONFIG, data);
        commit(SET_ROOT_CONFIG_HASH, readHeader(response.headers, 'x-config-hash'));
        commit(CRITICAL_ERROR_MSG, null);
        if (!data._bootstrap) sessionStorage.removeItem(SUB_CONFIG_RELOAD_KEY);
        return data;
      } catch (fetchError) {
        if (fetchError.response) {
          commit(
            CRITICAL_ERROR_MSG,
            'Failed to fetch configuration: Server responded with status '
            + `${fetchError.response?.status || 'mystery status'}`,
          );
        } else if (fetchError.request) {
          commit(CRITICAL_ERROR_MSG, 'Failed to fetch configuration: No response from server');
        } else {
          commit(CRITICAL_ERROR_MSG, `Failed to fetch configuration: ${fetchError.message}`);
        }
        return { ...emptyConfig };
      }
    },
    /**
     * Loads the active config. Pass a sub-page id to load that sub-page
     */
    async [INITIALIZE_CONFIG]({ commit, state }, subConfigId) {
      try {
        const targetId = subConfigId || null;
        if (!state.rootConfig) await this.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        const { hasStructural: rootHasStructural } = readLocalOverrides(null);
        const rootEffective = buildRootEffective(state);

        if (!targetId) {
          commit(SET_CONFIG, rootEffective);
          commit(SET_CONFIG_SOURCE, rootEffective);
          commit(SET_CURRENT_CONFIG_INFO, {});
          commit(SET_CONFIG_HASH, state.rootConfigHash);
          commit(SET_IS_USING_LOCAL_CONFIG, rootHasStructural);
          return rootEffective;
        }

        const subConfigPath = formatConfigPath(rootEffective.pages.find(
          (page) => page?.name && makePageName(page.name) === targetId,
        )?.path);
        if (!subConfigPath) {
          commit(CRITICAL_ERROR_MSG, `Unable to find config for '${targetId}'`);
          return { ...emptyConfig };
        }
        const isRemote = /^https?:\/\//i.test(subConfigPath);
        let response;
        try {
          response = await request.get(subConfigPath, isRemote ? {} : makeBasicAuthHeaders());
          sessionStorage.removeItem(SUB_CONFIG_RELOAD_KEY);
        } catch (fetchErr) {
          const status = fetchErr.response?.status;
          const auth = state.rootConfig?.appConfig?.auth || {};
          const ssoActive = Boolean(auth.enableOidc || auth.enableKeycloak);
          // Local 401 for OIDC caused by token expiration, trigger reload to re-auth
          if (status === 401 && ssoActive && !isRemote && !sessionStorage.getItem(SUB_CONFIG_RELOAD_KEY)) {
            sessionStorage.setItem(SUB_CONFIG_RELOAD_KEY, String(Date.now()));
            ErrorHandler(`Sub-config '${subConfigPath}' returned 401, reauthentication needed`);
            window.location.reload();
            return { ...emptyConfig };
          }
          commit(CRITICAL_ERROR_MSG, `Unable to load config from '${subConfigPath}'`);
          ErrorHandler(`Sub-config load failed: ${subConfigPath}`, fetchErr);
          return { ...emptyConfig };
        }
        let subFile;
        try {
          subFile = yamlLoad(response.data) || {};
        } catch (parseError) {
          commit(CRITICAL_ERROR_MSG, `Failed to parse sub-config YAML: ${parseError.message}`);
          return { ...emptyConfig };
        }
        // Sub-page's own intent: file merged with per-page localStorage, minus root-owned fields.
        const { own: subOwnLocal, hasStructural: subHasStructural } = readLocalOverrides(targetId);
        const subOwn = stripRootOwnedFields({
          appConfig: { ...(subFile.appConfig || {}), ...(subOwnLocal.appConfig || {}) },
          pageInfo: { ...(subFile.pageInfo || {}), ...(subOwnLocal.pageInfo || {}) },
          sections: subOwnLocal.sections || subFile.sections || [],
        });

        commit(SET_CONFIG, mergeWithRoot(rootEffective, subOwn));
        commit(SET_CONFIG_SOURCE, subOwn);
        commit(SET_CURRENT_CONFIG_INFO, { confPath: subConfigPath, confId: targetId });
        commit(SET_CONFIG_HASH, readHeader(response.headers, 'x-config-hash'));
        commit(SET_IS_USING_LOCAL_CONFIG, subHasStructural);
        return state.config;
      } catch (err) { // If we get here, then somethings really fucked up
        commit(CRITICAL_ERROR_MSG, `Unexpected error loading config: ${err.message}`);
        ErrorHandler('INITIALIZE_CONFIG failed', err);
        return { ...emptyConfig };
      }
    },

    /* Apply edited config content (from the YAML editor or the field modals) to the store. */
    [APPLY_EDITED_CONFIG]({ commit, state }, source) {
      const data = source || {};
      if (!state.currentConfigInfo.confId) {
        commit(SET_CONFIG, data);
        commit(SET_CONFIG_SOURCE, data);
        return;
      }
      const own = stripRootOwnedFields({
        appConfig: data.appConfig || {},
        pageInfo: data.pageInfo || {},
        sections: data.sections || [],
      });
      commit(SET_CONFIG, mergeWithRoot(buildRootEffective(state), own));
      commit(SET_CONFIG_SOURCE, own);
    },
  },
  modules: {},
});

export default store;
