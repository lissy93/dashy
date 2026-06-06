/** Reusable mixin for items */
import request from '@/utils/request';
import router from '@/router';
import longPress from '@/directives/LongPress';
import ErrorHandler from '@/utils/logging/ErrorHandler';
import {
  openingMethod as defaultOpeningMethod,
  serviceEndpoints,
  localStorageKeys,
  iconSize as defaultSize,
} from '@/utils/config/defaults';

export default {
  directives: {
    longPress,
  },
  props: {
    item: Object,
    isAddNew: Boolean,
  },
  data() {
    return {
      statusResponse: undefined,
      pingResponse: undefined,
      contextMenuOpen: false,
      intervalId: undefined, // status-check setInterval() id
      pingIntervalId: undefined, // ping-check setInterval() id
      contextPos: {
        posX: undefined,
        posY: undefined,
      },
      customStyles: {
        color: this.item.color,
        background: this.item.backgroundColor,
      },
    };
  },
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
    isEditMode() {
      return this.$store.state.editMode;
    },
    size() {
      const validSizes = ['small', 'medium', 'large'];
      if (this.itemSize && validSizes.includes(this.itemSize)) return this.itemSize;
      return this.$store.getters.iconSize || defaultSize;
    },
    /* Determines if user has enabled online status checks */
    enableStatusCheck() {
      const globalPref = this.appConfig.statusCheck || false;
      const itemPref = this.item.statusCheck;
      return typeof itemPref === 'boolean' ? itemPref : globalPref;
    },
    /* Determine how often to re-fire status checks */
    statusCheckInterval() {
      let interval = this.item.statusCheckInterval || this.appConfig.statusCheckInterval;
      if (!interval) return 0;
      if (interval > 60) interval = 60;
      if (interval < 1) interval = 0;
      return interval;
    },
    /* Determines the host to ping */
    pingCheckHost() {
      let host = this.item.pingCheckHost;
      if (!host || typeof host !== 'string') host = new URL(this.item.url, import.meta.url)?.hostname;
      if (!host || typeof host !== 'string') return undefined;
      return host.trim();
    },
    /* Determines if user has enabled hosts ping checks */
    isPingCheckEnabled() {
      const globalPref = this.appConfig.pingCheckEnabled || false;
      const itemPref = this.item.pingCheckEnabled;
      return (typeof itemPref === 'boolean' ? itemPref : globalPref) && !!this.pingCheckHost;
    },
    /* Determine how often to re-fire ping checks */
    pingCheckInterval() {
      let interval = this.item.pingCheckInterval;
      if (!interval) interval = this.appConfig.pingCheckInterval;
      if (!interval) return 0;
      interval = Math.floor(interval);
      if (interval < 0) interval = 0;
      if (interval > 5) interval = 5;
      return interval;
    },
    /* Determine the number of ping icmp packets to send per check */
    pingCheckCount() {
      let pingCount = this.item.pingCheckCount;
      if (!pingCount) pingCount = this.appConfig.pingCheckCount;
      if (!pingCount) return 3;
      pingCount = Math.floor(pingCount);
      if (pingCount > 5) pingCount = 5;
      if (pingCount < 1) pingCount = 3;
      return pingCount;
    },
    /* Determine delay in milliseconds for a ping check to complete */
    pingCheckTimeout() {
      let timeout = this.item.pingCheckTimeout;
      if (!timeout) timeout = this.appConfig.pingCheckTimeout;
      if (!timeout) return this.pingCheckInterval * 1000;
      let maxTimeout = this.pingCheckCount * 1000;
      if (timeout > maxTimeout) timeout = maxTimeout;
      if (timeout < 1) timeout = 0;
      return timeout;
    },
    accumulatedTarget() {
      return this.item.target || this.appConfig.defaultOpeningMethod || defaultOpeningMethod;
    },
    /* Convert config target value, into HTML anchor target attribute */
    anchorTarget() {
      if (this.isEditMode) return '_self';
      const target = this.accumulatedTarget;
      switch (target) {
        case 'sametab': return '_self';
        case 'newtab': return '_blank';
        case 'parent': return '_parent';
        case 'top': return '_top';
        default: return undefined;
      }
    },
    /* Get href for anchor, if not in edit mode, or opening in modal/ workspace */
    hyperLinkHref() {
      const nothing = '#';
      const url = this.url || this.item.url || nothing;
      if (this.isEditMode) return nothing;
      const noAnchorNeeded = ['modal', 'workspace', 'clipboard', 'newwindow'];
      return noAnchorNeeded.includes(this.accumulatedTarget) ? nothing : url;
    },
    /* Pulls together all user options, returns URL + Get params for status check endpoint */
    statusCheckApiUrl() {
      const {
        url,
        statusCheckUrl,
        statusCheckHeaders,
        statusCheckAllowInsecure,
        statusCheckAcceptCodes,
        statusCheckMaxRedirects,
      } = this.item;
      const encode = (str) => encodeURIComponent(str);
      // Find base URL, where the API is hosted
      const baseUrl = import.meta.env.VITE_APP_DOMAIN || window.location.origin;
      // Find correct URL to check, and encode
      const urlToCheck = `?&url=${encode(statusCheckUrl || url)}`;
      // Get, stringify and encode any headers
      const headers = statusCheckHeaders
        ? `&headers=${encode(JSON.stringify(statusCheckHeaders))}` : '';
      // Deterimine if user disabled security
      const enableInsecure = statusCheckAllowInsecure ? '&enableInsecure=true' : '';
      const acceptCodes = statusCheckAcceptCodes ? `&acceptCodes=${statusCheckAcceptCodes}` : '';
      const maxRedirects = statusCheckMaxRedirects ? `&maxRedirects=${statusCheckMaxRedirects}` : '';
      // Construct the full API endpoint's URL with GET params
      return `${baseUrl}${serviceEndpoints.statusCheck}/${urlToCheck}`
        + `${headers}${enableInsecure}${acceptCodes}${maxRedirects}`;
    },
    /* Pulls together all user options, returns URL + Get params for ping endpoint */
    pingCheckApiUrl() {
      const encode = (str) => encodeURIComponent(str);
      // Find base URL, where the API is hosted
      const baseUrl = import.meta.env.VITE_APP_DOMAIN || window.location.origin;
      // Find correct URL to check, and encode parameters
      const pingHost = `?&host=${encode(this.pingCheckHost)}`;
      const pingCount = this.pingCheckCount ? `&count=${this.pingCheckCount}` : '';
      const pingTimeout = this.pingCheckTimeout ? `&timeout=${this.pingCheckTimeout}` : '';
      // Construct the full API endpoint's URL with GET params
      return `${baseUrl}${serviceEndpoints.pingCheck}/${pingHost}${pingCount}${pingTimeout}`;
    },
    customStyle() {
      return `--open-icon:${this.unicodeOpeningIcon};`
        + `color:${this.item.color};`
        + `background:${this.item.backgroundColor}`;
    },
  },
  methods: {
    /* Checks if a given service is currently online */
    checkWebsiteStatus() {
      const endpoint = this.statusCheckApiUrl;
      if (this.statusResponse) this.statusResponse.successStatus = undefined; // Reset previous response, to show loading state
      request.get(endpoint)
        .then((response) => {
          if (response.data) this.statusResponse = response.data;
        })
        .catch(() => { // Something went very wrong.
          this.statusResponse = {
            statusText: 'Failed to make request',
            statusSuccess: false,
          };
        });
    },
    /* Checks if a given host responds to ping */
    checkPingStatus() {
      if (!this.isPingCheckEnabled) return;
      if (!this.pingCheckHost) {
        this.pingResponse = {
          statusText: 'Host not set or invalid',
          statusSuccess: false,
        };
      } else {
        if (this.pingResponse) this.pingResponse.successStatus = undefined; // Reset previous response, to show loading state
        const endpoint = this.pingCheckApiUrl;
        request.get(endpoint)
          .then((response) => {
            if (response.data) this.pingResponse = response.data;
          })
          .catch(() => { // Something went very wrong.
            this.pingResponse = {
              statusText: 'Failed to make Ping request',
              statusSuccess: false,
            };
          });
      }
    },
    /* Called when an item is clicked, manages the opening of modal & resets the search field */
    itemClicked(e) {
      const url = this.url || this.item.url;
      if (this.isEditMode) {
        // If in edit mode, open settings, and don't launch app
        e.preventDefault();
        this.openItemSettings();
        return;
      }
      // For certain opening methods, prevent default and manually navigate
      if (e.ctrlKey) {
        e.preventDefault();
        window.open(url, '_blank');
      } else if (e.altKey || this.accumulatedTarget === 'modal') {
        e.preventDefault();
        this.$emit('triggerModal', url);
      } else if (this.accumulatedTarget === 'workspace') {
        e.preventDefault();
        router.push({ name: 'workspace', query: { url } });
      } else if (this.accumulatedTarget === 'clipboard') {
        e.preventDefault();
        this.copyToClipboard(url);
      } else if (this.accumulatedTarget === 'newwindow') {
        e.preventDefault();
        const { width, height } = window.screen;
        window.open(url, '_blank', `width=${width},height=${height},noopener,noreferrer`);
      }
      // Emit event to clear search field, etc
      this.$emit('itemClicked');
      // Update the most/ last used ledger, for smart-sorting
      if (!this.appConfig.disableSmartSort) {
        this.incrementMostUsedCount(this.item.id);
        this.incrementLastUsedCount(this.item.id);
      }
    },
    /* Open item, using specified method */
    launchItem(method, link) {
      const url = link || this.item.url;
      this.contextMenuOpen = false;
      switch (method) {
        case 'newtab':
          window.open(url, '_blank');
          break;
        case 'sametab':
          window.open(url, '_self');
          break;
        case 'parent':
          window.open(url, '_parent');
          break;
        case 'top':
          window.open(url, '_top');
          break;
        case 'modal':
          this.$emit('triggerModal', url);
          break;
        case 'workspace':
          router.push({ name: 'workspace', query: { url } });
          break;
        case 'clipboard':
          this.copyToClipboard(url);
          break;
        case 'newwindow': {
          const { width, height } = window.screen;
          window.open(url, '_blank', `width=${width},height=${height},noopener,noreferrer`);
          break;
        }
        default: window.open(url, '_blank');
      }
    },
    /* Open custom context menu, and set position */
    openContextMenu(e) {
      this.contextMenuOpen = !this.contextMenuOpen;
      if (e && window) {
        // Calculate placement based on cursor and scroll position
        this.contextPos = {
          posX: e.clientX + window.pageXOffset,
          posY: e.clientY + window.pageYOffset,
        };
      }
    },
    /* Closes the context menu, called when user clicks literally anywhere */
    closeContextMenu() {
      this.contextMenuOpen = false;
    },
    /* Copies a string to the users clipboard / shows error if not possible  */
    copyToClipboard(content) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(content);
        this.$toast.success(this.$t('context-menus.item.copied-toast'));
      } else {
        ErrorHandler('Clipboard access requires HTTPS. See: https://bit.ly/3N5WuAA');
        this.$toast.error('Unable to copy, see log');
      }
    },
    /* Used for smart-sort when sorting items by most used apps */
    incrementMostUsedCount(itemId) {
      try {
        const mostUsed = JSON.parse(localStorage.getItem(localStorageKeys.MOST_USED) || '{}');
        mostUsed[itemId] = (mostUsed[itemId] || 0) + 1;
        localStorage.setItem(localStorageKeys.MOST_USED, JSON.stringify(mostUsed));
      } catch { /* ignore corrupt localStorage */ }
    },
    incrementLastUsedCount(itemId) {
      try {
        const lastUsed = JSON.parse(localStorage.getItem(localStorageKeys.LAST_USED) || '{}');
        lastUsed[itemId] = new Date().getTime();
        localStorage.setItem(localStorageKeys.LAST_USED, JSON.stringify(lastUsed));
      } catch { /* ignore corrupt localStorage */ }
    },
  },
};
