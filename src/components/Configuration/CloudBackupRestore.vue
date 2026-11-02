<template>
  <div class="cloud-backup-restore-wrapper">
    <!-- Intro text -->
    <div class="section intro">
      <h2>{{ $t('cloud-sync.title') }}</h2>
      <p class="intro">
        {{ $t('cloud-sync.intro-l1') }}
        <br><br>
        {{ $t('cloud-sync.intro-l2') }}
        <br>
        {{ $t('cloud-sync.intro-l3') }}
        <a href="https://github.com/Lissy93/dashy/blob/master/docs/backup-restore.md">{{ $t('cloud-sync.intro-docs') }}</a>.
      </p>
    </div>
    <!-- Create or update a backup form -->
    <div class="section backup-section">
      <h3 v-if="backupId">{{ $t('cloud-sync.backup-title-setup') }}</h3>
      <h3 v-else>{{ $t('cloud-sync.backup-title-setup') }}</h3>
      <Input
        v-model="backupPassword"
        name="backup-password"
        :label="backupId
          ? $t('cloud-sync.password-label-update') : $t('cloud-sync.password-label-setup')"
        layout="vertical"
        type="password"
      />
      <Button :click="checkPass">
        {{backupId
          ? $t('cloud-sync.backup-button-update') : $t('cloud-sync.backup-button-setup')}}
        <IconBackup />
      </Button>
      <div class="results-view" v-if="backupId">
        <span class="backup-id-label">{{ $t('cloud-sync.backup-id-label') }}: </span>
        <pre class="backup-id-value">{{ backupId }}</pre>
        <span class="backup-id-note">{{ $t('cloud-sync.backup-id-note') }}</span>
      </div>
    </div>
    <!-- Restore from backup form -->
    <div class="section restore-section">
      <h3>{{ $t('cloud-sync.restore-title') }}</h3>
      <Input
        v-model="restoreCode"
        name="restore-code"
        :label="$t('cloud-sync.restore-id-label')"
      />
      <Input
        v-model="restorePassword"
        name="restore-password"
        :label="$t('cloud-sync.restore-password-label')"
        type="password"
      />
      <Button :click="restoreBackup">
        {{ $t('cloud-sync.restore-button') }}
        <IconRestore />
      </Button>
    </div>
  </div>
</template>

<script>
// Import libraries
import sha256 from 'crypto-js/sha256';
import { Progress } from 'rsup-progress';
// Import form elements
import Button from '@/components/FormElements/Button';
import Input from '@/components/FormElements/Input';
// Import utils and constants
import StoreKeys from '@/utils/StoreMutations';
import { backup, update, restore } from '@/utils/CloudBackup';
import { applyPageStyles } from '@/utils/Theming';
import { localStorageKeys } from '@/utils/config/defaults';
import { configScope, stripRootOwnedFields } from '@/utils/config/ConfigHelpers';
import { InfoHandler, WarningInfoHandler, InfoKeys } from '@/utils/logging/ErrorHandler';
// Import Icons
import IconBackup from '@/assets/interface-icons/config-backup.svg';
import IconRestore from '@/assets/interface-icons/config-restore.svg';

export default {
  name: 'CloudBackupRestore',
  computed: {
    // Back up the active page's OWN config (partial for sub-pages, full for root)
    // so a restored sub-page file doesn't pin root's inherited values.
    config() {
      return this.$store.state.configSource;
    },
  },
  data() {
    return { // Store current form data (temp)
      backupPassword: '',
      restorePassword: '',
      restoreCode: '',
      backupId: localStorage[localStorageKeys.BACKUP_ID] || '',
      progress: new Progress({ color: 'var(--progress-bar)' }),
    };
  },
  components: { // UI components / icons
    Button,
    Input,
    IconBackup,
    IconRestore,
  },
  methods: {
    /* Make request to server-side, then either show error, or proceed to restore */
    restoreBackup() {
      this.progress.start();
      restore(this.restoreCode, this.restorePassword)
        .then((response) => {
          this.applyRestoredData(response, this.restoreCode);
          this.progress.end();
        }).catch((msg) => {
          this.showErrorMsg(msg);
          this.progress.end();
        });
    },
    /* Send request to backup server, to upload a new backup */
    makeBackup() {
      this.progress.start();
      backup(this.config, this.backupPassword)
        .then((response) => {
          if (!response.data || response.data.errorMsg || !response.data.backupId) {
            this.showErrorMsg(response.data.errorMsg || 'Error');
          } else { // All clear, no error
            this.updateUiAfterBackup(response.data.backupId, false);
          }
          this.progress.end();
        }).catch(() => {
          this.showErrorMsg(this.$t('cloud-sync.backup-error-unknown'));
          this.progress.end();
        });
    },
    /* Send request to backup server, to update an existing backup */
    makeUpdate() {
      this.progress.start();
      update(this.config, this.backupPassword, this.backupId)
        .then((response) => {
          if (!response.data || response.data.errorMsg || !response.data.backupId) {
            this.showErrorMsg(response.data.errorMsg || 'Error');
          } else { // All clear, no error
            this.updateUiAfterBackup(response.data.backupId, true);
          }
          this.progress.end();
        }).catch(() => {
          this.showErrorMsg(this.$t('cloud-sync.backup-error-unknown'));
          this.progress.end();
        });
    },
    /* For create / update a backup- checks pass is valid, then calls makeBackup */
    checkPass() {
      const savedHash = localStorage[localStorageKeys.BACKUP_HASH] || undefined;
      if (!this.backupPassword) {
        this.showErrorMsg(this.$t('cloud-sync.backup-missing-password'));
      } else if (!savedHash) {
        this.makeBackup();
      } else if (savedHash === this.makeHash(this.backupPassword)) {
        this.makeUpdate();
      } else {
        this.showErrorMsg(this.$t('cloud-sync.backup-error-password'));
      }
    },
    /* When restored data is received, save to localStorage (scoped to active page) and apply it */
    applyRestoredData(config, backupId) {
      const { confId } = this.$store.state.currentConfigInfo;
      const isSubPage = !!confId;
      const scope = configScope(confId);
      const clean = isSubPage ? stripRootOwnedFields(config) : config;
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
      if (!isSubPage) {
        localStorage.setItem(localStorageKeys.CONF_PAGES, JSON.stringify(config.pages || []));
      }
      this.setBackupIdLocally(backupId, this.restorePassword);
      this.$store.dispatch(StoreKeys.APPLY_EDITED_CONFIG, clean)
        .then(() => applyPageStyles(this.$store.getters.appConfig));
      this.showSuccessMsg(this.$t('cloud-sync.restore-success-msg'));
    },
    /* After backup/ update is made, then replace 'Make Backup' with 'Update Backup' */
    updateUiAfterBackup(backupId, isUpdate = false) {
      this.setBackupIdLocally(backupId, this.backupPassword);
      this.showSuccessMsg(
        `${isUpdate ? 'Update' : 'Backup'} ${this.$t('cloud-sync.backup-success-msg')}`,
      );
      this.backupPassword = '';
    },
    /* If the server returns a warning, then show to user and log it */
    showErrorMsg(errorMsg) {
      WarningInfoHandler(errorMsg, InfoKeys.CLOUD_BACKUP);
      this.$toast.error(errorMsg);
    },
    /* When server returns success message, then show to user and log it */
    showSuccessMsg(msg) {
      InfoHandler(msg, InfoKeys.CLOUD_BACKUP);
      this.$toast.success(msg);
    },
    /* Call to hash function, to hash the users chosen/ entered password */
    makeHash(pass) {
      return sha256(pass).toString();
    },
    /* After backup is applied, hash the backup ID, and save in browser storage */
    setBackupIdLocally(backupId, pass) {
      this.backupId = backupId;
      const hash = this.makeHash(pass);
      localStorage.setItem(localStorageKeys.BACKUP_ID, backupId);
      localStorage.setItem(localStorageKeys.BACKUP_HASH, hash);
    },
  },
};
</script>

<style scoped lang="scss">
  @import '@/styles/style-helpers.scss';
  div.cloud-backup-restore-wrapper {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    text-align: center;
    overflow: auto;
    height: 100%;
    color: var(--cloud-backup-color);
    background: var(--cloud-backup-background);
    @extend .scroll-bar;

    /* Text styling */
    h2, h3 { font-size: 1.6rem; }
    p.intro {
      text-align: left;
      font-size: 1rem;
      margin: 0.25rem;
      padding: 0.25rem;
    }

    /* Main sections */
    .section {
      display: flex;
      flex-direction: column;
      width: fit-content;
      margin: 0 auto 1rem auto;
      padding: 0 0.5rem 1rem 0.5rem;
    }
    /* Intro section */
    .section.intro {
      width: 100%;
      height: fit-content;
      border-bottom: 1px dashed var(--cloud-backup-color);
      a { color: var(--cloud-backup-color); }
    }
  }

  /* Container to show backup ID result from server */
  div.results-view {
    width: 16rem;
    margin: 0.5rem auto;
    padding: 0.5rem 0.75rem;
    box-sizing: border-box;
    border: 1px dashed var(--cloud-backup-color);
    border-radius: var(--curve-factor);
    text-align: left;
    .backup-id-label, .backup-id-value {
      display: inline;
      font-size: 1rem;
      margin-right: 0.5rem;
    }
    .backup-id-note {
      font-size: 0.8rem;
      display: block;
      opacity: 0.8;
      margin-top: 0.5rem;
    }
  }

  /* Overide form element colors, so that config menu can be themed by user */
  input, button {
    color: var(--cloud-backup-color);
    border: 1px solid var(--cloud-backup-color);
    background: none;
    width: 16rem;
  }
  input:focus {
    box-shadow: 1px 1px 6px var(--cloud-backup-color);
  }
  button:hover {
    color: var(--cloud-backup-background);
    border: 1px solid var(--cloud-backup-background);
    background: var(--cloud-backup-color);
  }

</style>
