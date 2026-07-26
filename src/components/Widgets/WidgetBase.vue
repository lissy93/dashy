<template>
  <div :class="`widget-base ${ loading ? 'is-loading' : '' }`">
    <!-- Update Action Button -->
    <Button :click="update" class="action-btn update-btn" v-if="!hideControls && !loading">
      <UpdateIcon />
    </Button>
    <!-- Edit Action Button (visible in edit mode) -->
    <Button :click="emitEdit" class="action-btn edit-btn" v-if="isEditMode && !loading">
      <EditIcon />
    </Button>
    <!-- Remove Action Button (visible in edit mode) -->
    <Button :click="emitRemove" class="action-btn remove-btn" v-if="isEditMode && !loading">
      <BinIcon />
    </Button>
    <!-- Loading Spinner -->
    <div v-if="loading" class="loading">
      <LoadingAnimation v-if="loading" class="loader" />
    </div>
    <!-- Error Message Display -->
    <div v-if="error" class="widget-error">
      <p class="error-msg">An error occurred, see the logs for more info.</p>
      <p class="error-output">{{ errorMsg }}</p>
      <p class="retry-link" @click="update">Retry</p>
    </div>
    <!-- Widget Label -->
    <div class="widget-label" v-if="widgetOptions.label">{{ widgetOptions.label }}</div>
    <!-- Widget -->
    <div :class="`widget-wrap ${ error ? 'has-error' : '' }`">
      <component
        v-bind:is="component"
        :options="widgetOptions"
        @loading="setLoaderState"
        @error="handleError"
        :ref="widgetRef"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
// Import form elements, icons and utils
import ErrorHandler from '@/utils/logging/ErrorHandler';
import Button from '@/components/FormElements/Button';
import UpdateIcon from '@/assets/interface-icons/widget-update.svg';
import EditIcon from '@/assets/interface-icons/config-edit-json.svg';
import BinIcon from '@/assets/interface-icons/interactive-editor-remove.svg';
import LoadingAnimation from '@/assets/interface-icons/loader.svg';

const widgetModules = import.meta.glob('./*.vue');

const COMPAT = {
  'adguard-dns-info': 'AdGuardDnsInfo',
  'adguard-filter-status': 'AdGuardFilterStatus',
  'adguard-stats': 'AdGuardStats',
  'adguard-top-domains': 'AdGuardTopDomains',
  addy: 'AnonAddy',
  anonaddy: 'AnonAddy',
  apod: 'Apod',
  'blacklist-check': 'BlacklistCheck',
  chucknorris: 'ChuckNorris',
  clock: 'Clock',
  'code-stats': 'CodeStats',
  'congress-trades': 'CongressTrades',
  'covid-stats': 'CovidStats',
  'crypto-price-chart': 'CryptoPriceChart',
  'crypto-watch-list': 'CryptoWatchList',
  'custom-search': 'CustomSearch',
  'custom-list': 'CustomList',
  customapi: 'CustomApi',
  'custom-api': 'CustomApi',
  'cve-vulnerabilities': 'CveVulnerabilities',
  'domain-monitor': 'DomainMonitor',
  'drone-ci': 'DroneCi',
  embed: 'EmbedWidget',
  'eth-gas-prices': 'EthGasPrices',
  'exchange-rates': 'ExchangeRates',
  filebrowser: 'Filebrowser',
  'flight-data': 'Flights',
  'github-profile-stats': 'GitHubProfile',
  'github-trending-repos': 'GitHubTrending',
  'gl-alerts': 'GlAlerts',
  'gl-current-cores': 'GlCpuCores',
  'gl-current-cpu': 'GlCpuGauge',
  'gl-cpu-speedometer': 'GlCpuSpeedometer',
  'gl-cpu-history': 'GlCpuHistory',
  'gl-disk-io': 'GlDiskIo',
  'gl-disk-space': 'GlDiskSpace',
  'gl-ip-address': 'GlIpAddress',
  'gl-load-history': 'GlLoadHistory',
  'gl-current-mem': 'GlMemGauge',
  'gl-mem-speedometer': 'GlMemSpeedometer',
  'gl-mem-history': 'GlMemHistory',
  'gl-network-interfaces': 'GlNetworkInterfaces',
  'gl-network-traffic': 'GlNetworkTraffic',
  'gl-system-load': 'GlSystemLoad',
  'gl-uptime': 'GlancesUptime',
  'gl-cpu-temp': 'GlCpuTemp',
  'gl-gpu': 'GlGpu',
  'gluetun-status': 'GluetunStatus',
  'health-checks': 'HealthChecks',
  'hackernews-trending': 'HackernewsTrending',
  iframe: 'IframeWidget',
  image: 'ImageWidget',
  joke: 'Jokes',
  linkding: 'Linkding',
  'live-tennis': 'LiveTennis',
  'minecraft-status': 'MinecraftStatus',
  'mullvad-status': 'MullvadStatus',
  mvg: 'Mvg',
  'mvg-connection': 'MvgConnection',
  'nd-cpu-history': 'NdCpuHistory',
  'nd-load-history': 'NdLoadHistory',
  'nd-ram-history': 'NdRamHistory',
  'news-headlines': 'NewsHeadlines',
  'nextcloud-notifications': 'NextcloudNotifications',
  'nextcloud-php-opcache': 'NextcloudPhpOpcache',
  'nextcloud-stats': 'NextcloudStats',
  'nextcloud-system': 'NextcloudSystem',
  'nextcloud-user': 'NextcloudUser',
  'nextcloud-user-status': 'NextcloudUserStatus',
  'ntfy-stream': 'NtfyStream',
  'pi-hole-stats': 'PiHoleStats',
  'pi-hole-stats-v6': 'PiHoleStatsV6',
  'pi-hole-top-queries': 'PiHoleTopQueries',
  'pi-hole-top-queries-v6': 'PiHoleTopQueriesV6',
  'pi-hole-traffic': 'PiHoleTraffic',
  'pi-hole-traffic-v6': 'PiHoleTrafficV6',
  'proxmox-lists': 'Proxmox',
  'public-holidays': 'PublicHolidays',
  'public-ip': 'PublicIp',
  'rescue-time': 'RescueTime',
  'rss-feed': 'RssFeed',
  sabnzbd: 'Sabnzbd',
  'sports-scores': 'SportsScores',
  'stat-ping': 'StatPing',
  'stock-price-chart': 'StockPriceChart',
  'synology-download': 'SynologyDownload',
  'system-info': 'SystemInfo',
  'tfl-status': 'TflStatus',
  trmm: 'TacticalRMM',
  'uptime-kuma': 'UptimeKuma',
  'uptime-kuma-status-page': 'UptimeKumaStatusPage',
  'wallet-balance': 'WalletBalance',
  weather: 'Weather',
  'weather-forecast': 'WeatherForecast',
  'xkcd-comic': 'XkcdComic',
  'gl-compact-metrics': 'GlCompactMetrics',
};

export default {
  name: 'Widget',
  components: {
    // Register form elements
    Button,
    UpdateIcon,
    EditIcon,
    BinIcon,
    LoadingAnimation,
  },
  props: {
    widget: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['editWidget', 'removeWidget'],
  data: () => ({
    loading: false,
    error: false,
    errorMsg: null,
  }),
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
    isEditMode() {
      return this.$store.state.editMode;
    },
    /* Returns the widget type, shows error if not specified */
    widgetType() {
      if (!this.widget.type) {
        ErrorHandler('Missing type attribute for widget');
        return null;
      }
      return this.widget.type.toLowerCase();
    },
    /* Returns users specified widget options, or empty object */
    widgetOptions() {
      const options = this.widget.options || {};
      const timeout = this.widget.timeout || null;
      const ignoreErrors = this.widget.ignoreErrors || false;
      const label = this.widget.label || null;
      const useProxy = this.appConfig.widgetsAlwaysUseProxy || !!this.widget.useProxy;
      const updateInterval = this.widget.updateInterval !== undefined
        ? this.widget.updateInterval : null;
      return {
        timeout, ignoreErrors, label, useProxy, updateInterval, ...options,
      };
    },
    /* A unique string to reference the widget by */
    widgetRef() {
      return `widget-${this.widgetType}-${this.index}`;
    },
    hideControls() {
      return this.widget.hideControls;
    },
    component() {
      const type = COMPAT[this.widgetType] || this.widget.type;
      if (!type) {
        ErrorHandler('Widget type was not found');
        return null;
      }
      const path = `./${type}.vue`;
      const loader = widgetModules[path];
      if (!loader) {
        ErrorHandler(`Widget component not found: ${type}`);
        return defineAsyncComponent(() => import('./Blank.vue'));
      }
      return defineAsyncComponent(() => loader().catch(() => import('./Blank.vue')));
    },
  },
  methods: {
    /* Calls update data method on widget */
    update() {
      this.error = false;
      this.$refs[this.widgetRef].update();
    },
    /* Shows message when error occurred */
    handleError(msg) {
      this.error = true;
      this.errorMsg = msg;
    },
    /* Toggles loading state */
    setLoaderState(loading) {
      this.loading = loading;
    },
    emitEdit() { this.$emit('editWidget'); },
    emitRemove() { this.$emit('removeWidget'); },
  },
};
</script>

<style scoped lang="scss">
@import "@/styles/media-queries.scss";

.widget-base {
  position: relative;
  padding: 0.75rem 0.5rem 0.5rem 0.5rem;
  background: var(--widget-base-background);
  box-shadow: var(--widget-base-shadow, none);

  // Refresh and full-page action buttons
  button.action-btn {
    height: 1rem;
    min-width: auto;
    width: 1.25rem;
    margin: 0;
    padding: 0.25rem;
    position: absolute;
    top: 0;
    border: none;
    opacity: var(--dimming-factor);
    color: var(--widget-text-color);
    svg { width: 0.75rem; height: 0.75rem; }

    &:hover {
      opacity: 1;
      color: var(--widget-background-color);
    }

    &.update-btn { right: -0.25rem; }
    &.edit-btn { right: 1rem; }
    &.remove-btn { right: 2.25rem; }
  }

  // Optional widget label
  .widget-label {
    color: var(--widget-text-color);
  }

  // Actual widget container
  .widget-wrap {
    &.has-error {
      cursor: not-allowed;
      opacity: 0.5;
      border-radius: var(--curve-factor);
      background: #ffff0040;

      &:hover { background: none; }
    }
  }

  // Error message output
  .widget-error {
    p.error-msg {
      color: var(--warning);
      font-weight: bold;
      font-size: 1rem;
      margin: 0 auto 0.5rem auto;
    }

    p.error-output {
      font-family: var(--font-monospace);
      color: var(--widget-text-color);
      font-size: 0.85rem;
      margin: 0.5rem auto;
    }

    p.retry-link {
      cursor: pointer;
      text-decoration: underline;
      color: var(--widget-text-color);
      font-size: 0.85rem;
      margin: 0;
    }
  }

  // Loading spinner
  .loading {
    margin: 0.2rem auto;
    text-align: center;

    svg.loader {
      width: 100px;
    }
  }

  // Hide widget contents while loading
  &.is-loading {
    .widget-wrap {
      display: none;
    }
  }
}
</style>
