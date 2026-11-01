/**
 * Utils for applying user's theme to the document
 */

import { localStorageKeys, mainCssVars, builtInThemes } from '@/utils/config/defaults';
import ErrorHandler from '@/utils/logging/ErrorHandler';

const EXTERNAL_STYLE_ID = 'user-defined-stylesheet';
const CUSTOM_CSS_ID = 'user-custom-css';
const EXTERNAL_SHEETS_TIMEOUT = 3000;
const html = () => document.documentElement;

/* Map of { label: href } for stylesheets declared in appConfig.externalStyleSheet */
export const getExternalThemes = (appConfig) => {
  const ext = appConfig?.externalStyleSheet;
  if (!ext) return {};
  if (Array.isArray(ext)) {
    return Object.fromEntries(ext.map((href, i) => [`External Stylesheet ${i + 1}`, href]));
  }
  if (typeof ext === 'string') return { 'External Stylesheet': ext };
  ErrorHandler('External stylesheets must be of type string or string[]');
  return {};
};

/* Inject every appConfig.externalStyleSheet, resolving once all have loaded/failed, or timed out */
export const loadExternalStyleSheets = (appConfig) => {
  const urls = [].concat(appConfig?.externalStyleSheet || []).filter((url) => {
    const valid = typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'));
    if (!valid) ErrorHandler(`Invalid external stylesheet URL: ${url}`);
    return valid;
  });
  const current = [...document.querySelectorAll('[data-external-source]')];
  const currentUrls = current.map((el) => el.getAttribute('href'));
  if (JSON.stringify(currentUrls) === JSON.stringify(urls)) return Promise.resolve();
  current.forEach((el) => el.remove());
  const loads = urls.map((url) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.dataset.externalSource = 'dashy';
    const loaded = new Promise((resolve) => { link.onload = resolve; link.onerror = resolve; });
    document.head.appendChild(link);
    return loaded;
  });
  const timeout = new Promise((resolve) => { setTimeout(resolve, EXTERNAL_SHEETS_TIMEOUT); });
  return Promise.race([Promise.all(loads), timeout]);
};

/* Apply appConfig.customCss to the page, replacing whatever was applied before */
export const applyCustomCss = (css) => {
  const cleanCss = typeof css === 'string' ? css.replace(/<\/?[^>]+(>|$)/g, '') : '';
  let style = document.getElementById(CUSTOM_CSS_ID);
  if (!cleanCss) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = CUSTOM_CSS_ID;
    document.head.insertBefore(style, document.querySelector('[data-external-source]'));
  }
  if (style.textContent !== cleanCss) style.textContent = cleanCss;
};

/* Apply a page's custom CSS and external stylesheets */
export const applyPageStyles = (appConfig) => {
  applyCustomCss(appConfig?.customCss);
  return loadExternalStyleSheets(appConfig);
};

/* Names of user-defined themes (appConfig.cssThemes). Always returns an array. */
export const getExtraThemeNames = (appConfig) => {
  const t = appConfig?.cssThemes;
  if (!t) return [];
  return typeof t === 'string' ? [t] : t;
};

const resetDom = () => {
  document.getElementById(EXTERNAL_STYLE_ID)?.remove();
  html().removeAttribute('data-theme');
};

const applyRemote = (href) => {
  resetDom();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.id = EXTERNAL_STYLE_ID;
  link.href = href;
  document.head.appendChild(link);
};

/* Collect every CSS var name that appears in any theme's custom colors */
const allKnownVarNames = (colorMap) => {
  const names = new Set();
  Object.values(colorMap || {}).forEach((themeVars) => {
    Object.keys(themeVars || {}).forEach((v) => names.add(v));
  });
  return names;
};

const applyCustomVars = (theme, appConfig) => {
  let localColors = {};
  try {
    localColors = JSON.parse(localStorage[localStorageKeys.CUSTOM_COLORS] || '{}');
  } catch (e) {
    ErrorHandler('Corrupted theme data in localstorage', e);
  }
  const configColors = appConfig?.customColors || {};

  // Clear any and all vars set by a previous theme
  const toClear = new Set([
    ...mainCssVars,
    ...allKnownVarNames(configColors),
    ...allKnownVarNames(localColors),
  ]);
  toClear.forEach((v) => html().style.removeProperty(`--${v}`));

  // Apply the current theme's custom colors (localStorage overrides appConfig)
  const vars = { ...configColors, ...localColors }[theme];
  if (!vars) return;
  Object.entries(vars).forEach(([k, v]) => html().style.setProperty(`--${k}`, v));
};

/**
 * Apply a theme name to the document
 * Handles built-in, user-defined, external stylesheets,
 * the special "default" reset, and per-theme custom CSS vars
 */
export const applyTheme = (theme, appConfig = {}) => {
  if (!theme) return;
  const externals = getExternalThemes(appConfig);
  const locals = [...builtInThemes, ...getExtraThemeNames(appConfig)];

  if (theme.toLowerCase() === 'default') {
    resetDom();
  } else if (locals.includes(theme)) {
    resetDom();
    html().setAttribute('data-theme', theme);
  } else if (externals[theme]) {
    applyRemote(externals[theme]);
  }
  applyCustomVars(theme, appConfig);
};
