<template>
  <div>
    <template v-if="monitors">
      <div v-for="(monitor, index) in monitors" :key="index" class="item-wrapper">
        <div class="item monitor-row">
          <div class="title-title"><span class="text">{{ monitor.name }}</span></div>
          <div class="monitors-container">
            <div class="status-container up-status">
              <span
                class="status-pill"
                :class="[monitor.statusClass, monitor.certClass]"
                v-tooltip="showCert ? {
                  content: (monitor.certTitle || '') + (
                    monitor.certClass === 'valid-cert' ? monitor.certDaysTitle : ''
                  ),
                  trigger: 'hover focus',
                  delay: { show: 350, hide: 100 },
                } : undefined"
                :title="showCert ? (monitor.certTitle || '') + (
                  monitor.certClass === 'valid-cert' ? monitor.certDaysTitle : ''
                ) : undefined"
              >
                {{ monitor.status }}
              </span>
            </div>
            <div class="status-container response-time">
              <span v-if="monitor.responseTime">
                {{ monitor.responseTime }}ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="errorMessage">
      <div class="error-message">
        <span class="text">{{ errorMessage }}</span>
      </div>
    </template>
  </div>
</template>

<script>
/**
 * A simple example which you can use as a template for creating your own widget.
 * Takes two optional parameters (`text` and `count`), and fetches a list of images
 * from dummyapis.com, then renders the results to the UI.
 */
import WidgetMixin from '@/mixins/WidgetMixin';

export default {
  mixins: [WidgetMixin],
  components: {},
  data() {
    return {
      monitors: null,
      errorMessage: null,
      errorMessageConstants: {
        missingApiKey: 'No API key set',
        missingUrl: 'No URL set',
      },
    };
  },

  mounted() {
    this.fetchData();
  },
  computed: {
    /* Get API key for access to instance */
    apiKey() {
      return this.parseAsEnvVar(this.options.apiKey);
    },
    /* Get instance URL */
    url() {
      return this.parseAsEnvVar(this.options.url);
    },
    /* Determine if the cert information should be shown */
    showCert() {
      return this.options.showCert;
    },
    /* Create authorisation header for the instance from the apiKey */
    authHeaders() {
      if (!this.apiKey) {
        return {};
      }
      const encoded = window.btoa(`:${this.apiKey}`);
      return { Authorization: `Basic ${encoded}` };
    },
  },
  methods: {
    /* The update() method extends mixin, used to update the data.
     * It's called by parent component, when the user presses update
     */
    update() {
      this.startLoading();
      this.fetchData();
    },
    /* Make the data request to the computed API endpoint */
    fetchData() {
      const { authHeaders, url } = this;

      if (!this.optionsValid({ authHeaders, url })) {
        return;
      }

      this.makeRequest(url, authHeaders)
        .then(this.processData);
    },
    /* Convert API response data into a format to be consumed by the UI */
    processData(response) {
      const monitorRows = this.getMonitorRows(response);

      const monitors = new Map();

      for (let index = 0; index < monitorRows.length; index += 1) {
        const row = monitorRows[index];
        this.processRow(row, monitors);
      }

      this.monitors = Array.from(monitors.values());
    },
    getMonitorRows(response) {
      return response.split('\n').filter(row => row.startsWith('monitor_'));
    },
    processRow(row, monitors) {
      const dataType = this.getRowDataType(row);
      const monitorName = this.getRowMonitorName(row);

      if (!monitors.has(monitorName)) {
        monitors.set(monitorName, { name: monitorName });
      }

      const monitor = monitors.get(monitorName);
      const value = this.getRowValue(row);

      const updated = this.setMonitorValue(dataType, monitor, value);

      monitors.set(monitorName, updated);
    },
    setMonitorValue(key, monitor, value) {
      const copy = { ...monitor };
      switch (key) {
        case 'monitor_cert_days_remaining': {
          if (!this.showCert) break;
          copy.certDaysTitle = ` for ${value} days`;
          break;
        }
        case 'monitor_cert_is_valid': {
          if (!this.showCert) break;
          copy.certClass = value === '1' ? 'valid-cert' : 'invalid-cert';
          copy.certTitle = `Certificate is ${value === '1' ? 'valid' : 'invalid'}`;
          break;
        }
        case 'monitor_response_time': {
          copy.responseTime = value;
          break;
        }
        case 'monitor_status': {
          switch (value) {
            case '1': {
              copy.status = 'Up';
              break;
            }
            case '2': {
              copy.status = 'Pending';
              break;
            }
            case '3': {
              copy.status = 'Maintenance';
              break;
            }
            default: {
              copy.status = 'Down';
              break;
            }
          }
          copy.statusClass = copy.status.toLowerCase();
          break;
        }
        default:
          break;
      }

      return copy;
    },
    getRowValue(row) {
      return this.getValueWithRegex(row, /[\s](-?\d+)(\.\d+)*\b$/);
    },
    getRowMonitorName(row) {
      return this.getValueWithRegex(row, /monitor_name="([^"]+)"/);
    },
    getRowDataType(row) {
      return this.getValueWithRegex(row, /^(.*?)\{/);
    },
    getValueWithRegex(string, regex) {
      const result = string.match(regex);

      if (!Array.isArray(result)) {
        return result;
      }

      if (result.length > 1) {
        // -1 means N/A
        if (result[1] === '-1' && !result[2]) {
          return null;
        }
        return result[1];
      }
      return result[0];
    },
    optionsValid({ url, authHeaders }) {
      const errors = [];
      if (url === undefined) {
        errors.push(this.errorMessageConstants.missingUrl);
      }

      if (authHeaders === undefined) {
        errors.push(this.errorMessageConstants.missingApiKey);
      }

      if (errors.length === 0) { return true; }

      this.errorMessage = errors.join('\n');
      return false;
    },
  },
};
</script>

<style scoped lang="scss">
.status-pill {
  border-radius: 50em;
  box-sizing: border-box;
  font-size: 0.75em;
  display: inline-block;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  padding: .35em .65em;
  margin: 0.1em 0.5em;
  min-width: 64px;

  &.up {
    background-color: rgb(92, 221, 139);
    color: black;

    &.invalid-cert {
      background-color: rgb(219, 216, 18);
      color: black;
    }
  }

  &.down {
    background-color: rgb(220, 53, 69);
    color: white;
  }

  &.pending {
    background-color: rgb(108, 117, 125);
    color: black;
  }

  &.maintenance {
    background-color: rgb(23, 71, 245);
    color: black;
  }
}

div.item.monitor-row:hover {
  background-color: var(--item-background);
  color: var(--current-color);
  opacity: 1;

  div.title-title>span.text {
    color: var(--current-color);
  }
}

.item-wrapper {
  container-type: inline-size;
  container-name: item-wrapper-container;
}

.monitor-row {
  display: flex;
  flex-direction: row;
  justify-content: left;
  padding: 0.35em 0.5em;
  align-items: center;

  .title-title {
    font-weight: bold;
    text-align: left;
    flex: 1 1 60%;
  }

  .monitors-container {
    display: flex;
    flex-wrap: wrap;
    flex: 0 1 40%;
    align-items: center;
    justify-content: space-around;

    .status-container.up-status {
      min-width: 7.5rem;
    }
    .status-container.response-time {
      min-width: 5rem;
    }
  }
}

@container item-wrapper-container (width < 320px) {
  .monitor-row {
    flex-direction: column;
    justify-content: center;

    .title-title {
      text-align: center;
    }

    .monitors-container {
      flex-wrap: unset;
      flex-direction: column;
    }
  }
}
</style>
