import { Progress } from 'rsup-progress';
import { dump as yamlDump } from '@/utils/yaml';
import request from '@/utils/request';
import ErrorHandler, { InfoHandler } from '@/utils/logging/ErrorHandler';
import { localStorageKeys, serviceEndpoints } from '@/utils/config/defaults';
import {
  configScope, stripRootOwnedFields, clearScopedLocalConfig, toSaveShape,
} from '@/utils/config/ConfigHelpers';
import StoreKeys from '@/utils/StoreMutations';

export default {
  data() {
    return {
      saveSuccess: undefined,
      responseText: '',
      progress: new Progress({ color: 'var(--progress-bar)' }),
    };
  },
  methods: {
    writeConfigToDisk(config, force = false) {
      const { state } = this.$store;
      if (state.config?.appConfig?.preventWriteToDisk) {
        ErrorHandler('Unable to write changes to disk, as this functionality is disabled');
        return Promise.resolve(false);
      }
      const isSubPag = !!state.currentConfigInfo.confId;
      if (isSubPag && state.currentConfigInfo.confPath?.includes('http')) {
        ErrorHandler('Cannot save to an external URL');
        return Promise.resolve(false);
      }
      // Strip runtime-only `filteredItems` and (for sub-pages) root-owned fields.
      // Shared with ConflictResolver.vue's diff-normalization so both sides of
      // a conflict diff are guaranteed the same serialization shape.
      const jsonConfig = toSaveShape(config, isSubPag);
      const yaml = yamlDump(JSON.parse(JSON.stringify(jsonConfig)));
      const baseUrl = import.meta.env.VITE_APP_DOMAIN || window.location.origin;
      const endpoint = `${baseUrl}${serviceEndpoints.save}`;
      const filename = isSubPag ? (state.currentConfigInfo.confPath || '') : '';
      const body = {
        config: yaml, timestamp: new Date(), filename, baseHash: state.configHash, force,
      };
      const saveRequest = request.post(endpoint, body);
      this.progress.start();
      return saveRequest.then((response) => {
        if (response.data.conflict) {
          this.progress.end();
          this.$store.commit(StoreKeys.SET_SAVE_CONFLICT, {
            yours: yaml,
            theirs: response.data.currentConfig,
            theirMtime: response.data.currentMtime,
          });
          return false;
        }
        this.saveSuccess = response.data.success || false;
        this.responseText = response.data.message;
        if (this.saveSuccess) {
          this.$store.commit(StoreKeys.SET_CONFIG_HASH, response.data.newHash);
          if (!isSubPag) {
            // A successful root save leaves disk holding exactly `jsonConfig`.
            // INITIALIZE_CONFIG's root branch rebuilds state.config from
            // state.rootConfig and re-derives configHash from rootConfigHash
            // on every re-initialize (nav away/back, Cancel, reset-to-defaults).
            // Without updating both here, that path would silently revert to
            // the page-load snapshot and the very next save would raise a
            // spurious conflict against our own just-completed write.
            this.$store.commit(StoreKeys.SET_ROOT_CONFIG, jsonConfig);
            this.$store.commit(StoreKeys.SET_ROOT_CONFIG_HASH, response.data.newHash);
          }
          this.carefullyClearLocalStorage();
          this.showToast(this.$t('config-editor.success-msg-disk'), true);
          InfoHandler('Config has been written to disk successfully', 'Config Update');
        } else {
          ErrorHandler(`Failed to save config. ${this.responseText || 'Unknown error'}`);
          this.showToast(this.$t('config-editor.error-msg-cannot-save'), false);
        }
        this.progress.end();
        this.$store.commit(StoreKeys.SET_EDIT_MODE, false);
        return this.saveSuccess;
      })
        .catch((error) => {
          this.saveSuccess = false;
          this.responseText = error.response?.data?.message || error.message || String(error);
          this.showToast(this.$t('config-editor.error-msg-cannot-save'), false);
          ErrorHandler(`Failed to save config. ${this.responseText}`);
          this.progress.end();
          return false;
        });
    },
    /* Persist the given config to localStorage under keys scoped to the active page */
    saveConfigLocally(config) {
      if (!this.permissions.allowSaveLocally) {
        ErrorHandler('Unable to save changes locally, this feature has been disabled');
        return;
      }
      const { confId } = this.$store.state.currentConfigInfo;
      const scope = configScope(confId);
      const clean = confId ? stripRootOwnedFields(config) : (config || {});
      const appConfig = clean.appConfig || {};

      localStorage.setItem(scope.APP_CONFIG, JSON.stringify(appConfig));
      localStorage.setItem(scope.PAGE_INFO, JSON.stringify(clean.pageInfo || {}));
      localStorage.setItem(scope.CONF_SECTIONS, JSON.stringify(clean.sections || []));
      const setOrClear = (key, value) => {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
      };
      setOrClear(scope.THEME, appConfig.theme);
      setOrClear(scope.LAYOUT, appConfig.layout);
      setOrClear(scope.ICON_SIZE, appConfig.iconSize);
      setOrClear(scope.LANGUAGE, appConfig.language);
      // pages is root-owned - only persisted from root context
      if (!confId) {
        localStorage.setItem(localStorageKeys.CONF_PAGES, JSON.stringify(clean.pages || []));
      }

      InfoHandler('Config has successfully been saved in browser storage', 'Config Update');
      this.showToast(this.$t('config-editor.success-msg-local'), true);
      this.$store.commit(StoreKeys.SET_EDIT_MODE, false);
    },
    /* After a successful disk write clear local overrides */
    carefullyClearLocalStorage() {
      clearScopedLocalConfig(this.$store.getters.pages);
    },
  },
};
