import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import request from '@/utils/request';
import ErrorHandler from '@/utils/logging/ErrorHandler';
import WalletBalance from '@/components/Widgets/WalletBalance.vue';

vi.mock('@/utils/request', () => ({ default: vi.fn() }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));

const ADDRESS = 't1bw1SefijsXRDQVxC9w64XsRK8hBhtQohQ';
const TX_IN = 'a'.repeat(64);
const TX_OUT = 'b'.repeat(64);

const sochainSummary = {
  status: 'success',
  data: {
    txs_sent: 1,
    txs_received: 2,
    txs_total: 3,
    confirmed_balance: '1.25000000',
    unconfirmed_balance: '0.10000000',
    confirmed_received: '3.00000001',
    first_active: { height: 100, time: 1700000000 },
    last_active: { height: 200, time: 1710000000 },
  },
};

const sochainTransactions = {
  status: 'success',
  data: {
    transactions: [
      {
        hash: TX_IN, value_sent: '0.00000000', value_received: '0.10000000',
        balance_change: '0.10000000', time: 1710000100, block: null, price: null,
      },
      {
        hash: TX_OUT, value_sent: '1.75000001', value_received: '0.00000000',
        balance_change: '-1.75000001', time: 1710000000, block: 200, price: null,
      },
    ],
  },
};

const blockcypherAddress = {
  balance: 150000000,
  unconfirmed_balance: 0,
  final_balance: 150000000,
  total_sent: 50000000,
  total_received: 200000000,
  txrefs: [{
    tx_hash: TX_IN, value: 200000000, confirmed: '2024-03-09T16:00:00Z',
    confirmations: 5, block_height: 830000, ref_balance: 200000000, tx_input_n: -1,
  }],
};

/* Answers each SoChain endpoint with its fixture */
const sochainResponder = (config) => Promise.resolve({
  data: config.url.includes('/address_summary/') ? sochainSummary : sochainTransactions,
});

const tooltip = { mounted: () => {} };

async function mount(options = {}) {
  const wrapper = shallowMount(WalletBalance, {
    props: { options: { coin: 'zec', address: ADDRESS, ...options } },
    global: { directives: { tooltip }, mocks: { $t: (key) => key } },
  });
  await flushPromises();
  return wrapper;
}

const urls = () => request.mock.calls.map(([config]) => config.url);

describe('WalletBalance widget', () => {
  beforeEach(() => {
    request.mockReset();
    ErrorHandler.mockReset();
    request.mockImplementation(sochainResponder);
  });

  it('keeps BlockCypher as the default provider', async () => {
    request.mockResolvedValue({ data: blockcypherAddress });
    const wrapper = await mount({ coin: 'btc', address: '3853bSxupMjvxEYfwGDGAaLZhTKxB2vEVC' });
    expect(urls()).toEqual([
      'https://api.blockcypher.com/v1/btc/main/addrs/3853bSxupMjvxEYfwGDGAaLZhTKxB2vEVC',
    ]);
    expect(wrapper.find('.main-balance').text()).toBe('1.500000 BTC');
  });

  it('uses SoChain for Zcash, which BlockCypher does not support', async () => {
    await mount();
    expect(urls()).toEqual([
      `https://sochain.com/api/v3/address_summary/ZEC/${ADDRESS}`,
      `https://sochain.com/api/v3/transactions/ZEC/${ADDRESS}`,
    ]);
  });

  it('shows SoChain balances, with total out worked out exactly', async () => {
    const wrapper = await mount();
    expect(wrapper.find('.main-balance').text()).toBe('1.250000 ZEC');
    expect(wrapper.vm.balances.final).toBe('1.350000 ZEC');
    const amounts = wrapper.findAll('.balance-info-row .amount').map((node) => node.text());
    expect(amounts[0]).toBe('+ 3.000000 ZEC');
    expect(amounts[1]).toBe('- 1.750000 ZEC');
    expect(amounts[2]).toMatch(/ago$/);
  });

  it('lists SoChain transactions as in or out, linked to the SoChain explorer', async () => {
    const wrapper = await mount();
    const rows = wrapper.findAll('a.transaction-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].find('.amount').classes()).toContain('in');
    expect(rows[0].find('.amount').text()).toBe('+0.100000 ZEC');
    expect(rows[1].find('.amount').classes()).toContain('out');
    expect(rows[1].find('.amount').text()).toBe('-1.750000 ZEC');
    expect(rows[1].attributes('href')).toBe(`https://sochain.com/zec/tx/${TX_OUT}`);
    expect(wrapper.vm.transactions[0].blockHeight).toBe('Unconfirmed');
    expect(wrapper.find('a.wallet-address').attributes('href'))
      .toBe(`https://sochain.com/zec/address/${ADDRESS}`);
  });

  it('respects limit with SoChain', async () => {
    const wrapper = await mount({ limit: 1 });
    expect(wrapper.findAll('a.transaction-row')).toHaveLength(1);
  });

  it('sends the API key as the API-KEY header only when one is set', async () => {
    await mount({ provider: 'sochain', coin: 'doge' });
    expect(request.mock.calls[0][0].headers).toBeNull();

    request.mockClear();
    await mount({ provider: 'sochain', coin: 'doge', apiKey: 'test-key' });
    request.mock.calls.forEach(([config]) => {
      expect(config.headers).toEqual({ 'API-KEY': 'test-key' });
    });
  });

  it('passes the API key to the proxy when useProxy is set', async () => {
    await mount({
      provider: 'sochain', coin: 'ltc', apiKey: 'DASHY_SOCHAIN_API_KEY', useProxy: true,
    });
    const [config] = request.mock.calls[0];
    expect(config.headers['Target-URL']).toContain('/address_summary/LTC/');
    expect(JSON.parse(config.headers.CustomHeaders)).toEqual({ 'API-KEY': 'DASHY_SOCHAIN_API_KEY' });
  });

  it('maps network test to the SoChain testnet', async () => {
    await mount({ provider: 'sochain', coin: 'btc', network: 'test' });
    expect(urls()[0]).toContain('/address_summary/BTCTEST/');
  });

  it('does not send other networks, or coins SoChain lacks, to SoChain', async () => {
    await mount({ provider: 'sochain', coin: 'btc', network: 'test3' });
    await mount({ provider: 'sochain', coin: 'eth' });
    expect(request).not.toHaveBeenCalled();
    expect(ErrorHandler).toHaveBeenCalledTimes(2);
  });

  it('reports a SoChain error answer', async () => {
    request.mockResolvedValue({
      data: { status: 'fail', data: { error_message: 'Invalid address.' } },
    });
    const wrapper = await mount();
    expect(ErrorHandler).toHaveBeenCalledWith('SoChain returned an error', 'Invalid address.');
    expect(wrapper.vm.balances).toBeNull();
  });
});
