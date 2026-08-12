import i18n from '@/utils/i18n';
import { loadLocale } from '@/utils/languages';
import { localStorageKeys, language as defaultLanguage } from '@/utils/config/defaults';
import store from '@/store';
import ErrorHandler from '@/utils/logging/ErrorHandler';

const setLocale = (code) => {
  if (i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
    i18n.global.locale.value = code;
  } else {
    i18n.global.locale = code;
  }
};

export const resolvePreferredLocale = () => (
  localStorage[localStorageKeys.LANGUAGE]
  || store.state.config?.appConfig?.language
  || defaultLanguage
);

export const applyUserLocale = async (preferredCode) => {
  const code = preferredCode || resolvePreferredLocale();
  try {
    const msg = await loadLocale(code);
    i18n.global.setLocaleMessage(code, msg);
  } catch (e) {
    ErrorHandler(`Failed to load locale '${code}'`, e);
  }
  setLocale(code);
  return code;
};
