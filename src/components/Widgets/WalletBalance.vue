<template>
<div class="wallet-balance-wrapper">
  <p class="wallet-title">{{ getCoinNameFromSymbol(coin) }} Wallet</p>
  <a v-if="metaInfo" :href="metaInfo.explorer" class="wallet-address">{{ address }}</a>
  <div class="balance-inner">
    <img v-if="metaInfo" :src="metaInfo.qrCode" alt="QR Code" class="wallet-qr" />
    <div v-if="balances" class="balances-section">
      <p class="main-balance" v-tooltip="makeBalanceTooltip(balances)">{{ balances.current }}</p>
      <div class="balance-info">
        <div class="balance-info-row">
          <span class="label">Total In</span>
          <span class="amount">+ {{ balances.totalReceived }}</span>
        </div>
        <div class="balance-info-row">
          <span class="label">Total Out:</span>
          <span class="amount">- {{ balances.totalSent }}</span>
        </div>
        <div class="balance-info-row">
          <span class="label">Last Activity:</span>
          <span class="amount">{{ balances.lastTransaction }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="transactions" v-if="transactions">
    <p class="transactions-title">Recent Transactions</p>
    <a class="transaction-row"
      v-for="transaction in transactions"
      :key="transaction.hash"
      :href="transaction.url"
      v-tooltip="makeTransactionTooltip(transaction)"
    >
      <span class="date">{{ transaction.date }}</span>
      <span :class="`amount ${transaction.incoming ? 'in' : 'out'}`">
        {{ transaction.incoming ? '+' : '-'}}{{ transaction.amount }}
      </span>
    </a>
  </div>
</div>
</template>

<script>
import WidgetMixin from '@/mixins/WidgetMixin';
import { widgetApiEndpoints } from '@/utils/config/defaults';
import { timestampToDate, timestampToTime, getTimeAgo } from '@/utils/MiscHelpers';

/* Coins which SoChain serves, and their testnets */
const SOCHAIN_COINS = ['btc', 'ltc', 'doge', 'zec'];

/* SoChain amounts are exact decimal strings with 8 decimals, e.g. "0.00012345".
 * These convert to and from whole units with BigInt, so sums are exact */
const toUnits = (amount) => {
  const [whole, fraction = ''] = String(amount || '0').replace('-', '').split('.');
  const units = BigInt(whole || '0') * 100000000n + BigInt(fraction.padEnd(8, '0').slice(0, 8));
  return String(amount).startsWith('-') ? -units : units;
};
const fromUnits = (units) => {
  const sign = units < 0n ? '-' : '';
  const abs = units < 0n ? -units : units;
  return `${sign}${abs / 100000000n}.${String(abs % 100000000n).padStart(8, '0')}`;
};

export default {
  mixins: [WidgetMixin],
  computed: {
    coin() {
      if (!this.options.coin) this.error('You must specify a coin, e.g. \'BTC\'');
      return this.options.coin.toLowerCase();
    },
    address() {
      if (!this.options.address) this.error('You must specify a public address');
      return this.parseAsEnvVar(this.options.address);
    },
    network() {
      return this.options.network || 'main';
    },
    limit() {
      return this.options.limit || 10;
    },
    /* BlockCypher by default. Zcash is only available from SoChain */
    provider() {
      if (this.options.provider) return this.options.provider.toLowerCase();
      return this.coin === 'zec' ? 'sochain' : 'blockcypher';
    },
    /* SoChain's network name, e.g. DOGE, or BTCTEST (Bitcoin testnet4) for network: test */
    sochainNetwork() {
      const suffix = this.network === 'test' ? 'TEST' : '';
      return `${this.coin.toUpperCase()}${suffix}`;
    },
    /* Optional SoChain API key, sent as the API-KEY header */
    sochainHeaders() {
      const apiKey = this.parseAsEnvVar(this.options.apiKey);
      return apiKey ? { 'API-KEY': apiKey } : null;
    },
    endpoint() {
      return `${widgetApiEndpoints.walletBalance}/`
      + `${this.coin}/${this.network}/addrs/${this.address}`;
    },
    divisionFactor() {
      switch (this.coin) {
        case ('btc'): return 100000000;
        case ('eth'): return 1000000000000000000;
        default: return 1;
      }
    },
  },
  data() {
    return {
      balances: null,
      metaInfo: null,
      transactions: null,
    };
  },
  methods: {
    fetchData() {
      if (this.provider === 'sochain') {
        this.fetchSochainData();
      } else {
        this.makeRequest(this.endpoint).then(this.processData);
      }
    },
    /* Checks SoChain supports the coin and network, and returns an error message if not */
    sochainOptionsError() {
      if (!SOCHAIN_COINS.includes(this.coin)) {
        return `SoChain supports ${SOCHAIN_COINS.join(', ')}, not '${this.coin}'`;
      }
      if (!['main', 'test'].includes(this.network)) {
        return 'With SoChain, network must be \'main\' or \'test\' (Bitcoin testnet4)';
      }
      return null;
    },
    fetchSochainData() {
      const optionsError = this.sochainOptionsError();
      if (optionsError) {
        this.error(optionsError);
        this.finishLoading();
        return;
      }
      const base = widgetApiEndpoints.walletBalanceSochain;
      const path = `${this.sochainNetwork}/${this.address}`;
      Promise.all([
        this.makeRequest(`${base}/address_summary/${path}`, this.sochainHeaders),
        this.makeRequest(`${base}/transactions/${path}`, this.sochainHeaders),
      ]).then(([summary, history]) => {
        if (summary.status !== 'success' || history.status !== 'success') {
          const failed = summary.status !== 'success' ? summary : history;
          this.error('SoChain returned an error', (failed.data || {}).error_message);
          return;
        }
        this.processSochainData(summary.data, history.data.transactions || []);
      }).catch(() => {}); // Request errors are already shown by makeRequest
    },
    processSochainData(summary, transactions) {
      const symbol = this.coin.toUpperCase();
      const formatAmount = (units) => {
        const abs = units < 0n ? -units : units;
        return `${Number(fromUnits(abs)).toFixed(6)} ${symbol}`;
      };
      const confirmed = toUnits(summary.confirmed_balance);
      const unconfirmed = toUnits(summary.unconfirmed_balance);
      const received = toUnits(summary.confirmed_received);
      const lastActive = summary.last_active;
      this.balances = {
        current: formatAmount(confirmed),
        unconfirmed: formatAmount(unconfirmed),
        final: formatAmount(confirmed + unconfirmed),
        totalSent: formatAmount(received - confirmed),
        totalReceived: formatAmount(received),
        lastTransaction: lastActive ? getTimeAgo(lastActive.time * 1000) : 'Never',
      };
      const explorer = `https://sochain.com/${this.sochainNetwork.toLowerCase()}`;
      this.transactions = transactions.slice(0, this.limit).map((transaction) => {
        const change = toUnits(transaction.balance_change);
        return {
          hash: transaction.hash,
          amount: formatAmount(change),
          date: timestampToDate(transaction.time * 1000),
          time: timestampToTime(transaction.time * 1000),
          blockHeight: transaction.block === null ? 'Unconfirmed' : transaction.block,
          incoming: change >= 0n,
          url: `${explorer}/tx/${transaction.hash}`,
        };
      });
    },
    processData(data) {
      const formatAmount = (amount) => {
        const symbol = this.coin.toUpperCase();
        if (!amount) return `0 ${symbol}`;
        return `${(amount / this.divisionFactor).toFixed(6)} ${symbol}`;
      };
      this.balances = {
        current: formatAmount(data.balance),
        unconfirmed: formatAmount(data.unconfirmed_balance),
        final: formatAmount(data.final_balance),
        totalSent: formatAmount(data.total_sent),
        totalReceived: formatAmount(data.total_received),
        lastTransaction: data.txrefs[0] ? getTimeAgo(data.txrefs[0].confirmed) : 'Never',
      };
      const transactions = [];
      data.txrefs.forEach((transaction) => {
        transactions.push({
          hash: transaction.tx_hash,
          amount: formatAmount(transaction.value),
          date: timestampToDate(transaction.confirmed),
          time: timestampToTime(transaction.confirmed),
          confirmations: transaction.confirmations,
          blockHeight: transaction.block_height,
          balance: formatAmount(transaction.ref_balance),
          incoming: transaction.tx_input_n === -1,
          url: `https://live.blockcypher.com/${this.coin}/tx/${transaction.tx_hash}/`,
        });
      });
      this.transactions = transactions.slice(0, this.limit);
    },
    getCoinNameFromSymbol(symbol) {
      const coins = {
        btc: 'Bitcoin',
        dash: 'Dash',
        doge: 'Doge',
        ltc: 'Litecoin',
        eth: 'Ethereum',
        bhc: 'BitcoinCash',
        xmr: 'Monero',
        ada: 'Cardano',
        bcy: 'BlockCypher',
        zec: 'Zcash',
      };
      if (!symbol || !Object.keys(coins).includes(symbol.toLowerCase())) return '';
      return coins[symbol.toLowerCase()];
    },
    makeBalanceTooltip(balances) {
      return this.tooltip(
        `<b>Unconfirmed:</b> ${balances.unconfirmed}<br><b>Final:</b> ${balances.final}`,
        true,
      );
    },
    makeTransactionTooltip(transaction) {
      return this.tooltip(
        `At ${transaction.time}<br>`
        + `<b>BlockHeight:</b> ${transaction.blockHeight}`
        + (transaction.confirmations !== undefined
          ? `<br><b>Confirmations:</b> ${transaction.confirmations}` : '')
        + (transaction.balance !== undefined
          ? `<br><b>Balance After:</b> ${transaction.balance}` : ''),
        true,
      );
    },
    makeMetaInfo() {
      const explorer = this.provider === 'sochain'
        ? `https://sochain.com/${this.sochainNetwork.toLowerCase()}/address/${this.address}`
        : `https://live.blockcypher.com/${this.coin}/address/${this.address}/`;
      const coin = this.getCoinNameFromSymbol(this.coin).toLowerCase();
      const qrCode = `${widgetApiEndpoints.walletQrCode}/`
      + `?style=${coin.toLowerCase()}&color=11&address=${this.address}`;
      return { explorer, coin, qrCode };
    },
  },
  mounted() {
    this.metaInfo = this.makeMetaInfo();
  },
};
</script>

<style scoped lang="scss">
.wallet-balance-wrapper {
  max-width: 30rem;
  margin: 0 auto;
  a.wallet-address {
    display: block;
    margin: 0.5rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: var(--dimming-factor);
    color: var(--widget-text-color);
    font-family: var(--font-monospace);
  }
  .balance-inner {
    display: flex;
    justify-content: space-around;
    img.wallet-qr {
      max-width: 7rem;
      margin: 0.5rem 0;
      border-radius: var(--curve-factor);
    }
    .balances-section {
      p {
        color: var(--widget-text-color);
        font-family: var(--font-monospace);
        cursor: default;
        margin: 0.5rem;
      }
      p.main-balance {
        font-size: 1.5rem;
      }
      .balance-info .balance-info-row {
        opacity: var(--dimming-factor);
        color: var(--widget-text-color);
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin: 0.2rem 0.5rem;
        span.amount {
          font-family: var(--font-monospace);
        }
      }
    }
  }
  p.wallet-title, p.transactions-title {
    color: var(--widget-text-color);
    margin: 0.5rem 0 0.25rem;
    font-size: 1.2rem;
    font-weight: bold;
  }
  .transactions .transaction-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    text-decoration: none;
    span {
      color: var(--widget-text-color);
      font-family: var(--font-monospace);
    }
    span.amount {
      &.in { color: var(--success); }
      &.out { color: var(--danger); }
    }
    &:not(:last-child) { border-bottom: 1px dashed var(--widget-text-color); }
  }
}
</style>
