<template>
  <div class="congress-trades">
    <p class="empty-state" v-if="trades && !trades.length">No matching disclosures</p>
    <a
      class="trade"
      v-for="trade in trades"
      :key="trade.id"
      :href="trade.filingPortal"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="trade-heading">
        <span class="ticker">{{ trade.ticker }}</span>
        <span :class="['transaction', `transaction-${trade.type}`]">
          {{ trade.typeLabel }}
        </span>
        <span
          v-if="!hidePerformance"
          :class="['performance', `performance-${trade.performanceDirection}`]"
        >
          {{ trade.performance }}
        </span>
      </div>
      <p class="member">
        {{ trade.member }}
        <span>{{ trade.chamber }}<template v-if="trade.state"> · {{ trade.state }}</template></span>
      </p>
      <div class="trade-details">
        <span>{{ trade.amount }}</span>
        <span>{{ trade.transactionDate }}</span>
      </div>
    </a>
    <p class="disclaimer" v-if="trades && trades.length">
      STOCK Act disclosures can be filed after the transaction date.
    </p>
  </div>
</template>

<script>
import WidgetMixin from '@/mixins/WidgetMixin';
import { widgetApiEndpoints } from '@/utils/config/defaults';

const CHAMBERS = ['house', 'senate'];
const TRANSACTION_TYPES = ['purchase', 'sale', 'exchange'];

export default {
  mixins: [WidgetMixin],
  data() {
    return {
      trades: null,
    };
  },
  computed: {
    apiKey() {
      return this.parseAsEnvVar(this.options.apiKey) || '';
    },
    ticker() {
      return typeof this.options.ticker === 'string'
        ? this.options.ticker.trim().toUpperCase() : '';
    },
    member() {
      return typeof this.options.member === 'string' ? this.options.member.trim() : '';
    },
    chamber() {
      return CHAMBERS.includes(this.options.chamber) ? this.options.chamber : '';
    },
    transactionType() {
      return TRANSACTION_TYPES.includes(this.options.transactionType)
        ? this.options.transactionType : '';
    },
    limit() {
      const value = parseInt(this.options.limit, 10);
      return Number.isInteger(value) && value >= 1 && value <= 20 ? value : 5;
    },
    hidePerformance() {
      return this.options.hidePerformance || false;
    },
    headers() {
      return this.apiKey ? { 'X-Api-Key': this.apiKey } : null;
    },
    endpoint() {
      const params = new URLSearchParams({ limit: String(this.limit) });
      if (this.ticker) params.set('ticker', this.ticker);
      if (this.member) params.set('member', this.member);
      if (this.chamber) params.set('chamber', this.chamber);
      if (this.transactionType) params.set('type', this.transactionType);
      return `${widgetApiEndpoints.congressTrades}?${params.toString()}`;
    },
  },
  methods: {
    fetchData() {
      this.makeRequest(this.endpoint, this.headers)
        .then(this.processData)
        .catch(() => { /* Error already surfaced by the mixin */ });
    },
    processData(data) {
      const results = data && Array.isArray(data.trades) ? data.trades : [];
      this.trades = results.map((trade, index) => this.makeTrade(trade, index));
    },
    makeTrade(trade, index) {
      const type = TRANSACTION_TYPES.includes(trade.type) ? trade.type : 'other';
      const performance = Number(trade.perf_pct);
      const hasPerformance = trade.perf_pct !== null && Number.isFinite(performance);
      let performanceDirection = 'neutral';
      if (hasPerformance && performance !== 0) {
        performanceDirection = performance > 0 ? 'positive' : 'negative';
      }
      return {
        id: `${trade.member_slug || trade.member || 'member'}-${trade.ticker || 'asset'}-${trade.transaction_date || index}-${index}`,
        ticker: trade.ticker || 'N/A',
        member: trade.member || 'Unknown member',
        chamber: trade.chamber === 'senate' ? 'Senate' : 'House',
        state: trade.state || '',
        type,
        typeLabel: type === 'other' ? 'Trade' : `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
        amount: trade.amount_range || 'Amount not reported',
        transactionDate: this.formatDate(trade.transaction_date),
        performance: hasPerformance ? `${performance > 0 ? '+' : ''}${performance.toFixed(2)}%` : '—',
        performanceDirection,
        filingPortal: trade.filing_portal || 'https://www.bargo.ai/free-apis/congress',
      };
    },
    formatDate(value) {
      if (!value) return 'Date unavailable';
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return value;
      return new Intl.DateTimeFormat(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      }).format(date);
    },
  },
  created() {
    // Bargo responses are cached for five minutes, so refreshing more often
    // would consume quota without showing newer disclosure data.
    this.overrideUpdateInterval = 300;
  },
};
</script>

<style scoped lang="scss">
.congress-trades {
  color: var(--widget-text-color);

  .empty-state, .disclaimer {
    margin: 0.5rem auto;
    text-align: center;
    opacity: var(--dimming-factor);
  }

  .empty-state { font-size: 1rem; }

  .trade {
    display: block;
    padding: 0.45rem 0.25rem;
    color: var(--widget-text-color);
    text-decoration: none;

    &:not(:last-of-type) {
      border-bottom: 1px dashed var(--widget-text-color);
    }

    &:hover .ticker { text-decoration: underline; }
  }

  .trade-heading {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .ticker {
      min-width: 3.5rem;
      font-family: var(--font-monospace);
      font-size: 1.05rem;
      font-weight: bold;
    }

    .transaction {
      padding: 0.05rem 0.35rem;
      border-radius: var(--curve-factor);
      background: var(--widget-accent-color);
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .transaction-purchase { color: var(--success, var(--widget-text-color)); }
    .transaction-sale { color: var(--warning, var(--widget-text-color)); }

    .performance {
      margin-left: auto;
      font-family: var(--font-monospace);
      font-size: 0.85rem;
      font-weight: bold;
    }

    .performance-positive { color: var(--success, var(--widget-text-color)); }
    .performance-negative { color: var(--danger, var(--warning)); }
    .performance-neutral { opacity: var(--dimming-factor); }
  }

  .member {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 0.2rem 0;
    font-size: 0.85rem;

    span {
      flex-shrink: 0;
      opacity: var(--dimming-factor);
    }
  }

  .trade-details {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.72rem;
    opacity: var(--dimming-factor);
  }

  .disclaimer {
    font-size: 0.65rem;
  }
}
</style>
