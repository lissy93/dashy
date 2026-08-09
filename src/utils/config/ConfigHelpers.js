import ConfigAccumulator from '@/utils/config/ConfigAccumalator';
import filterUserSections from '@/utils/CheckSectionVisibility';
import { languages } from '@/utils/languages';
import {
  visibleComponents,
  localStorageKeys,
  language as defaultLanguage,
} from '@/utils/config/defaults';

/* Page id used in URLs to mean "the root config" */
export const RESERVED_ROOT = 'main';

/* Fields owned exclusively by the root config, sub-pages always inherit */
const ROOT_OWNED_TOP_LEVEL = ['pages'];
const ROOT_OWNED_APP_CONFIG = ['auth'];

/* Return a shallow copy of `config` with root-owned fields removed */
export const stripRootOwnedFields = (config) => {
  if (!config || typeof config !== 'object') return config;
  const clean = { ...config };
  ROOT_OWNED_TOP_LEVEL.forEach((key) => delete clean[key]);
  if (clean.appConfig && typeof clean.appConfig === 'object') {
    clean.appConfig = { ...clean.appConfig };
    ROOT_OWNED_APP_CONFIG.forEach((key) => delete clean.appConfig[key]);
  }
  return clean;
};

/* The exact shape ConfigSaving.js's writeConfigToDisk serializes to disk (and
 * uses as the "yours" side of a conflict diff): root-owned fields stripped
 * for sub-pages, and the runtime-only `filteredItems` dropped from every
 * section. This is deliberately the single place that logic lives - both the
 * real save path and ConflictResolver's diff-normalization import it, so
 * neither can drift out of sync with the other and reintroduce
 * serialization-shape noise into the conflict diff. */
export const toSaveShape = (config, isSubPage) => {
  const base = isSubPage ? stripRootOwnedFields(config) : { ...(config || {}) };
  return {
    ...base,
    sections: (base.sections || []).map(({ filteredItems: _filteredItems, ...s }) => s),
  };
};

/* Local storage keys for local settings, if confId is set it's for a sub-page */
export const configScope = (confId) => {
  const suffix = confId ? `-${confId}` : '';
  return {
    APP_CONFIG: `${localStorageKeys.APP_CONFIG}${suffix}`,
    PAGE_INFO: `${localStorageKeys.PAGE_INFO}${suffix}`,
    CONF_SECTIONS: `${localStorageKeys.CONF_SECTIONS}${suffix}`,
    THEME: `${localStorageKeys.THEME}${suffix}`,
    LAYOUT: `${localStorageKeys.LAYOUT_ORIENTATION}${suffix}`,
    ICON_SIZE: `${localStorageKeys.ICON_SIZE}${suffix}`,
    LANGUAGE: `${localStorageKeys.LANGUAGE}${suffix}`,
  };
};

/* Remove all local config settings from localStorage, leave unrelated stuff */
export const clearScopedLocalConfig = (pages) => {
  const clearScope = (confId) => {
    Object.values(configScope(confId)).forEach((key) => localStorage.removeItem(key));
  };
  clearScope(null);
  localStorage.removeItem(localStorageKeys.CONF_PAGES);
  (pages || []).forEach((page) => {
    if (page?.name) clearScope(makePageName(page.name));
  });
};

/* Metadata for each view in the canonical /<view>/:page?/:section? URL scheme */
export const VIEW_META = {
  home: { supportsSection: true },
  minimal: { supportsSection: true },
  workspace: { supportsSection: false },
};

/* How a URL's :page segment resolves against the current config */
export const PAGE_STATUS = Object.freeze({
  ROOT: 'root', // no :page, or :page === RESERVED_ROOT
  KNOWN: 'known', // matches a real sub-page in config.pages
  LEGACY_SECTION: 'legacy', // one-segment URL naming a section of the root config
  UNKNOWN: 'unknown', // no match, store raises a critical error
});

/* Given a page or section name, produces a deterministic URL slug.
 * - NFC-normalizes, lowercase, replaces whitespace with -, strips extension
 * - Drops most punctuation/symbols, except unicode alphanumeric + marks */
export const makePageName = (pageName) => {
  if (!pageName) return 'unnamed-page';
  const cleaned = String(pageName)
    .normalize('NFC')
    .toLowerCase()
    .replace(/\.yml$/i, '')
    .replace(/\s+/g, '-')
    .replace(/[\uFE00-\uFE0F]|[\u{E0100}-\u{E01EF}]/gu, '')
    .replace(/[^\p{L}\p{N}\p{M}_-]/gu, '')
    .replace(/^-+|-+$/g, '');
  if (!cleaned) return 'unnamed-page';
  if (cleaned === RESERVED_ROOT) return `${RESERVED_ROOT}-page`;
  return cleaned;
};

/* Build a canonical Dashy route: /<view>[/<pageId-or-main>[/<sectionSlug>]]
 * pageId is slugified sub-config id or null for root
 * If section is present, then page ID is also needed, defaults to RESERVED_ROOT
 * Can drop the section if the page type (e.g. workspace) doesn't support sec view */
export const makeRoutePath = (view, pageId, sectionName) => {
  const resolvedView = VIEW_META[view] ? view : 'home';
  const base = `/${resolvedView}`;
  if (sectionName && VIEW_META[resolvedView].supportsSection) {
    return `${base}/${pageId || RESERVED_ROOT}/${makePageName(sectionName)}`;
  }
  if (pageId) return `${base}/${pageId}`;
  return base;
};

/* Convenience wrapper: turn a raw page name into a view URL (e.g. nav links) */
export const makePageSlug = (pageName, view) => makeRoutePath(view, makePageName(pageName));

/* Extract the view segment from a path, defaulting to 'home' */
export const viewFromPath = (path) => {
  const seg = (path || '').split('/').filter(Boolean)[0];
  return VIEW_META[seg] ? seg : 'home';
};

/* Parse a Vue Router route into { view, pageId, sectionSlug, status } */
export const resolveRouteIntent = (route, store) => {
  const view = viewFromPath(route?.path);
  const { page: rawPage, section: rawSection } = route?.params || {};
  const sectionSlug = rawSection ? makePageName(rawSection) : null;

  if (!rawPage || rawPage === RESERVED_ROOT) {
    return { view, pageId: null, sectionSlug, status: PAGE_STATUS.ROOT };
  }
  const pageId = makePageName(rawPage);
  const pages = store?.getters?.pages || [];
  if (pages.some((p) => p?.name && makePageName(p.name) === pageId)) {
    return { view, pageId, sectionSlug, status: PAGE_STATUS.KNOWN };
  }
  // Legacy one-segment URL naming a root section (only when no explicit :section)
  if (!rawSection) {
    const rootSections = store?.state?.rootConfig?.sections || [];
    if (rootSections.some((s) => s?.name && makePageName(s.name) === pageId)) {
      return { view, pageId: null, sectionSlug: pageId, status: PAGE_STATUS.LEGACY_SECTION };
    }
  }
  return { view, pageId, sectionSlug, status: PAGE_STATUS.UNKNOWN };
};

/* Put fetch path for additional configs in correct format */
export const formatConfigPath = (configPath) => {
  if (!configPath) return null;
  if (configPath.includes('http')) return configPath;
  const stripped = configPath.replace(/^\.\//, '');
  if (stripped.substring(0, 1) !== '/') return `/${stripped}`;
  return stripped;
};

/**
 * Initiates the Accumulator class and generates a complete config object
 * Self-executing function, returns the full user config as a JSON object
 */
export const config = (() => {
  const Accumulator = new ConfigAccumulator();
  return {
    appConfig: Accumulator.appConfig(),
    pageInfo: Accumulator.pageInfo(),
    sections: filterUserSections(Accumulator.sections()),
  };
})();

/**
 * Generates an object containing booleans indicating which
 * components should be hidden. This enables the user to hide
 * parts of the page and disable functionality that they don't need/ want
 * All options fallback on the values defined in the defaults
 * @param {object} appConfig The full app config
 * @returns {object} result
 */
export const componentVisibility = (appConfig) => {
  // Get users choice from app config
  const usersChoice = appConfig.hideComponents || {};
  // Checks if value is defined, and is a boolean
  const isThere = (userValue) => typeof userValue === 'boolean';
  // For each option, return users choice (if specified), else use the default
  return {
    pageTitle: isThere(usersChoice.hideHeading)
      ? !usersChoice.hideHeading : visibleComponents.pageTitle,
    navigation: isThere(usersChoice.hideNav)
      ? !usersChoice.hideNav : visibleComponents.navigation,
    searchBar: isThere(usersChoice.hideSearch)
      ? !usersChoice.hideSearch : visibleComponents.searchBar,
    settings: isThere(usersChoice.hideSettings)
      ? !usersChoice.hideSettings : visibleComponents.settings,
  };
};

/**
 * Returns a list of items which the user has assigned a hotkey to
 * So that when the hotkey is pressed, the app/ service can be launched
 */
export const getCustomKeyShortcuts = (sections) => (sections || [])
  .flatMap((section) => (section.items || [])
    .filter((item) => item.hotkey)
    .map((item) => ({ hotkey: item.hotkey, url: item.url })));

/**
 * Gets the users chosen language. Defaults to English.
 * If for any reason a lang code changes, add to legacyAliases for backwards compat
 * @returns {object} Language, including code, name and flag
 */
export const getUsersLanguage = () => {
  const langCode = localStorage[localStorageKeys.LANGUAGE]
    || config.appConfig.language
    || defaultLanguage;
  const legacyAliases = { cn: 'zh-CN' };
  const resolvedCode = legacyAliases[langCode] || langCode;
  const langObj = languages.find(lang => lang.code === resolvedCode);
  return langObj;
};
