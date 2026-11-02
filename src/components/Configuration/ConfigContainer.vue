<template>
  <Tabs :navAuto="true" name="Add Item" ref="tabView" v-bind:class="{ hideTabs: !enableConfig }">
    <!-- Main tab -->
    <TabItem :name="$t('config.main-tab')" class="main-tab">
      <div class="main-options-container">
        <div class="config-buttons">
          <h2>{{ $t('config.heading') }}</h2>
          <!-- Export config button -->
          <Button class="config-button" :disallow="!enableConfig" :click="openExportConfigTab">
            {{ $t('config.download-config-button') }}
            <DownloadIcon class="button-icon"/>
          </Button>
          <!-- Edit config button -->
          <Button class="config-button" :disallow="!enableConfig" :click="openEditConfigTab">
            {{ $t('config.edit-config-button') }}
            <EditIcon class="button-icon"/>
          </Button>
          <!-- Language switcher button -->
          <Button class="config-button" :click="openLanguageSwitchModal">
            {{ $t('config.change-language-button') }}
            <LanguageIcon class="button-icon"/>
          </Button>
          <!-- CSS / Styling button -->
          <Button class="config-button" :disallow="!enableConfig" :click="openEditCssTab">
            {{ $t('config.edit-css-button') }}
            <CustomCssIcon class="button-icon"/>
          </Button>
          <!-- Cloud sync button -->
          <Button class="config-button" :disallow="!enableConfig" :click="openCloudSyncTab">
            {{backupId ? $t('config.edit-cloud-sync-button') : $t('config.cloud-sync-button') }}
            <CloudIcon class="button-icon"/>
          </Button>
          <!-- Reset local changes button -->
          <Button class="config-button" :click="resetLocalSettings">
            {{ $t('config.reset-settings-button') }}
            <DeleteIcon class="button-icon"/>
          </Button>
          <!-- Debug info button -->
          <Button class="config-button" :click="openDebugTab">
            {{ $t('config.debug-info-button') }}
            <DebugIcon class="button-icon" />
          </Button>
          <!-- About modal button -->
          <Button class="config-button" :click="openAboutTab">
            {{ $t('config.app-info-button') }}
            <IconAbout class="button-icon" />
          </Button>
          <!-- Display app version and language -->
          <div class="instance-info">
            <p class="language-and-theme">
                {{ getLanguage() }}
                {{ currentTheme ? `• 🎨 ${currentTheme}` : '' }}
            </p>
            <!-- Display location of config file -->
            <p class="config-location">
                Using config from
                <a :href="configPath">{{ configPath }}</a>
            </p>
            <AppVersion :doUpdateCheck="false" />
          </div>
        </div>
        <!-- Display note if Config disabled, or if on mobile -->
        <p v-if="!enableConfig" class="config-disabled-note">{{ $t('config.disabled-note') }}</p>
        <p class="small-screen-note" style="display: none;">{{ $t('config.small-screen-note') }}</p>
      </div>
    </TabItem>
    <TabItem id="edit" :name="$t('config.edit-config-tab')" v-if="enableConfig">
      <JsonEditor />
    </TabItem>
    <TabItem id="export" :name="$t('config.view-config-tab')" v-if="enableConfig">
      <ExportConfigMenu @navigate-tab="navigateToTabById" />
    </TabItem>
    <TabItem id="css" :name="$t('config.custom-css-tab')" v-if="enableConfig">
      <CustomCssEditor />
    </TabItem>
    <TabItem id="debug" :name="$t('config.debug-info-button')" hidden>
      <DebugInfo />
    </TabItem>
    <TabItem id="about" :name="$t('config.app-info-button')" hidden>
      <AppInfo @navigate-tab="navigateToTabById" />
    </TabItem>
    <TabItem id="cloud" :name="$t('cloud-sync.title')" v-if="enableConfig" hidden>
      <CloudBackupRestore />
    </TabItem>
  </Tabs>
  <ConfirmDialog
    v-model:open="showResetConfirm"
    danger
    :title="$t('config.reset-settings-button')"
    :message="resetConfirmMessage()"
    @confirm="confirmResetLocalSettings"
  />
</template>

<script>

import { defineAsyncComponent, h } from 'vue';
import { localStorageKeys, modalNames } from '@/utils/config/defaults';
import { getUsersLanguage, clearScopedLocalConfig } from '@/utils/config/ConfigHelpers';
import ErrorHandler from '@/utils/logging/ErrorHandler';
import StoreKeys from '@/utils/StoreMutations';
import { applyPageStyles } from '@/utils/Theming';
import CustomCssEditor from '@/components/Configuration/CustomCss';
import CloudBackupRestore from '@/components/Configuration/CloudBackupRestore';
import AppInfo from '@/components/Configuration/AppInfo';
import DebugInfo from '@/components/Configuration/DebugInfo';
import AppVersion from '@/components/Configuration/AppVersion';
import ExportConfigMenu from '@/components/InteractiveEditor/ExportConfigMenu';
import Button from '@/components/FormElements/Button';
import ConfirmDialog from '@/components/FormElements/ConfirmDialog';
import Tabs from '@/components/FormElements/Tabs';
import TabItem from '@/components/FormElements/TabItem';
import DownloadIcon from '@/assets/interface-icons/config-download-file.svg';
import DeleteIcon from '@/assets/interface-icons/config-delete-local.svg';
import EditIcon from '@/assets/interface-icons/config-edit-json.svg';
import CustomCssIcon from '@/assets/interface-icons/config-custom-css.svg';
import CloudIcon from '@/assets/interface-icons/cloud-backup-restore.svg';
import LanguageIcon from '@/assets/interface-icons/config-language.svg';
import IconAbout from '@/assets/interface-icons/application-about.svg';
import DebugIcon from '@/assets/interface-icons/config-debug-menu.svg';

const EditorLoading = {
  render: () => h('p', { class: 'editor-loading-placeholder' }, 'Loading editor…'),
};
const JsonEditor = defineAsyncComponent({
  loader: () => import('@/components/Configuration/JsonEditor.vue'),
  loadingComponent: EditorLoading,
});

export default {
  name: 'ConfigContainer',
  data() {
    return {
      backupId: localStorage[localStorageKeys.BACKUP_ID] || '',
      appVersion: import.meta.env.VITE_APP_VERSION,
      latestVersion: '',
      showResetConfirm: false,
    };
  },
  props: {
    config: { type: Object, required: true },
  },
  computed: {
    sections: function getSections() {
      return this.config.sections;
    },
    enableConfig() {
      return this.$store.getters.permissions.allowViewConfig;
    },
    configPath() {
      return this.$store.state.currentConfigInfo?.confPath
      || import.meta.env.VITE_APP_CONFIG_PATH
      || '/conf.yml';
    },
    currentTheme() {
        return this.$store.getters.appConfig?.theme || '';
    }
  },
  components: {
    Tabs,
    TabItem,
    Button,
    ConfirmDialog,
    JsonEditor,
    CustomCssEditor,
    CloudBackupRestore,
    AppInfo,
    DebugInfo,
    AppVersion,
    ExportConfigMenu,
    DownloadIcon,
    DeleteIcon,
    EditIcon,
    CloudIcon,
    CustomCssIcon,
    LanguageIcon,
    IconAbout,
    DebugIcon,
  },
  methods: {
    /* Progamatically navigates to a given tab by index */
    navigateToTab(tabInxex) {
      const itemToSelect = this.$refs.tabView.navItems[tabInxex];
      this.$refs.tabView.activeTabItem(itemToSelect);
    },
    /* Navigates to a tab by its id */
    navigateToTabById(id) {
      if (!id) return;
      const items = this.$refs.tabView?.navItems || [];
      const index = items.findIndex((t) => t.id === id);
      if (index >= 0) this.navigateToTab(index);
    },
    openAboutTab() {
      this.navigateToTabById('about');
    },
    openDebugTab() {
      this.navigateToTabById('debug');
    },
    openLanguageSwitchModal() {
      this.$modal.show(modalNames.LANG_SWITCHER);
    },
    openExportConfigTab() {
      if (this.enableConfig) {
        this.navigateToTabById('export');
      } else {
        this.unauthorized();
      }
    },
    openEditConfigTab() {
      this.navigateToTabById('edit');
    },
    openCloudSyncTab() {
      this.navigateToTabById('cloud');
    },
    openEditCssTab() {
      this.navigateToTabById('css');
    },
    /* Clears config-scoped localStorage entries for root + all sub-pages, then reloads config.
     * Preserves unrelated keys (auth tokens, backup hashes, mostUsed etc) */
    resetLocalSettings() {
      this.showResetConfirm = true;
    },
    confirmResetLocalSettings() {
      clearScopedLocalConfig(this.$store.getters.pages);
      this.$toast(this.$t('config.data-cleared-msg'));
      this.$store.dispatch(StoreKeys.INITIALIZE_CONFIG, this.$store.state.currentConfigInfo.confId)
        .then(() => applyPageStyles(this.$store.getters.appConfig));
    },
    resetConfirmMessage() {
      return `${this.$t('config.reset-config-msg-l1')} `
        + `${this.$t('config.reset-config-msg-l2')}\n\n${this.$t('config.reset-config-msg-l3')}`;
    },
    getLanguage() {
      const lang = getUsersLanguage();
      return lang ? `${lang.flag} ${lang.name}` : '';
    },
    /* If launching menu from editor, navigate to correct starting tab.
     * Accepts either a numeric index (legacy) or a stable tab id string. */
    navigateToStartingTab() {
      const navTo = this.$store.state.navigateConfToTab;
      if (typeof navTo === 'string' && navTo) {
        this.navigateToTabById(navTo);
      } else if (typeof navTo === 'number' && navTo >= 0) {
        this.navigateToTab(navTo);
      }
      this.$store.commit(StoreKeys.CONF_MENU_INDEX, undefined);
    },
    unauthorized() {
      ErrorHandler('Unauthorized Operation - Config Disabled');
    },
  },
  mounted() {
    this.navigateToStartingTab();
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/style-helpers.scss';
@import '@/styles/media-queries.scss';

pre {
  color: var(--config-code-color);
  font-weight: bold !important;
  padding: 0.5rem 1rem;
}

a.config-button, button.config-button {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 1.2rem;
  background: var(--config-settings-background);
  color: var(--config-settings-color);
  border: 1px solid var(--config-settings-color);
  margin: 0.5rem auto;
  min-width: 15rem;
  width: 100%;
  svg.button-icon {
    width: 1rem;
    height: 1rem;
    padding: 0.2rem;
  }
  &:hover:not(.disallowed) {
    background: var(--config-settings-color);
    color: var(--config-settings-background);
  }
}

a.hyperlink-wrapper {
  margin: 0 auto;
  text-decoration: none;
  min-width: 18rem;
  width: 100%;
}

.instance-info {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
    align-items: center;
    p.app-version, p.language-and-theme, p.config-location {
      margin: 0;
      font-size: 1rem;
      color: var(--config-settings-color);
      cursor: default;
      opacity: var(--dimming-factor);
      a {
        color: var(--config-settings-color);
      }
    }
    p.language-and-theme {
        text-transform: capitalize;
    }
}

div.code-container {
  background: var(--config-code-background);
  .yaml-action-buttons {
    position: absolute;
    top: 1.5rem;
    right: 0.5rem;
    display: flex;
    flex-direction: column;
    border: 1px dashed;
    padding: 0.5rem;
    border-radius: 4px;
    h2 {
      margin: 0;
      text-align: center;
      color: var(--config-code-color);
    }
    a.yaml-button {
      padding:  0.25rem 0.5rem;
      font-size: 1rem;
      color: var(--config-code-color);
      border-radius: var(--curve-factor);
      cursor: pointer;
      text-decoration: underline;
      border: 1px solid var(--config-code-background);
      &:hover {
        color: var(--config-code-color);
        border-color: var(--config-code-color);
        text-decoration: none;
      }
      &:active {
        color: var(--config-code-background);
        background-color: var(--config-settings-color);
        text-decoration: none;
      }
    }
  }
}

.tab-item {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  @extend .scroll-bar;
  background: var(--config-settings-background);
}

.main-options-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.config-buttons {
  display: flex;
  flex-direction: column;
  background: var(--config-settings-background);
  height: calc(100% + 1rem);
  width: fit-content;
  margin: 0 auto;
  padding: 2rem 1rem 0;
  h2 {
    margin: 0 auto 1rem auto;
    color: var(--config-settings-color);
  }
}

.config-note {
  width: 80%;
  max-width: 700px;
  left: 10%;
  bottom: 1rem;
  margin: 0.5rem auto;
  padding: 0.5rem 0.75rem;
  text-align: center;
  border: 1px dashed var(--config-settings-color);
  border-radius: var(--curve-factor);
  opacity: var(--dimming-factor);
  color: var(--config-settings-color);
  background: var(--config-settings-background);
  cursor: default;
  p.sub-title {
    font-weight: bold;
    margin: 0;
    display: inline;
  }
  &:hover { opacity: 1; }
  display: none;
  @include tablet-up { display: block; }
}
p.config-disabled-note {
  margin: 0.5rem auto;
  padding: 0 0.5rem;
  font-weight: bold;
  color: var(--warning);
  opacity: var(--dimming-factor);
}
p.small-screen-note {
    @include phone {
      display: block !important;
    }
    margin: 0.5rem auto;
    padding: 0 0.5rem;
    text-align: center;
    opacity: 0.8;
    font-size: 0.9rem;
    color: var(--warning);
  }
</style>

<style lang="scss">

.hideTabs .tab__pagination {
  display: none !important;
}

.tab-item {
  background: var(--config-settings-background) !important;
}

.editor-loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55vh;
  margin: 0;
  font-size: 1rem;
  color: var(--config-settings-color);
  opacity: var(--dimming-factor);
}

</style>
