import {
  describe, it, expect, afterEach, vi,
} from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import CongressTrades from '@/components/Widgets/CongressTrades.vue';

const tradesResponse = {
  trades: [
    {
      member: 'Nancy Pelosi',
      member_slug: 'nancy-pelosi',
      chamber: 'house',
      state: 'CA',
      ticker: 'NVDA',
      type: 'purchase',
      amount_range: '$1,000,001 - $5,000,000',
      transaction_date: '2026-06-20',
      perf_pct: 3.456,
      filing_portal: 'https://disclosures-clerk.house.gov/example',
    },
    {
      member: 'Example Senator',
      member_slug: 'example-senator',
      chamber: 'senate',
      state: 'NY',
      ticker: 'AAPL',
      type: 'sale',
      amount_range: '$15,001 - $50,000',
      transaction_date: '2026-06-18',
      perf_pct: -1.2,
      filing_portal: 'https://efdsearch.senate.gov/example',
    },
  ],
  page: 1,
  limit: 5,
  count: 2,
};

let mockResponse = tradesResponse;

vi.mock('@/utils/request', () => {
  const fn = vi.fn(() => Promise.resolve({ data: mockResponse }));
  fn.get = fn; fn.post = fn; fn.put = fn;
  return { default: fn };
});
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));

const baseOptions = {
  timeout: null, ignoreErrors: false, label: null, useProxy: false, updateInterval: null,
};

function mountWidget(options = {}) {
  return shallowMount(CongressTrades, {
    props: { options: { ...baseOptions, ...options } },
  });
}

describe('CongressTrades widget', () => {
  let wrapper;
  afterEach(() => {
    mockResponse = tradesResponse;
    if (wrapper) wrapper.unmount();
  });

  it('renders each disclosure with its main details', async () => {
    wrapper = mountWidget();
    await flushPromises();
    expect(wrapper.findAll('.trade')).toHaveLength(2);
    expect(wrapper.text()).toContain('NVDA');
    expect(wrapper.text()).toContain('Nancy Pelosi');
    expect(wrapper.text()).toContain('Purchase');
    expect(wrapper.text()).toContain('$1,000,001 - $5,000,000');
    expect(wrapper.find('.trade').attributes('href'))
      .toBe('https://disclosures-clerk.house.gov/example');
  });

  it('formats positive and negative performance', async () => {
    wrapper = mountWidget();
    await flushPromises();
    const performance = wrapper.findAll('.performance');
    expect(performance[0].text()).toBe('+3.46%');
    expect(performance[0].classes()).toContain('performance-positive');
    expect(performance[1].text()).toBe('-1.20%');
    expect(performance[1].classes()).toContain('performance-negative');
  });

  it('hides performance when configured', async () => {
    wrapper = mountWidget({ hidePerformance: true });
    await flushPromises();
    expect(wrapper.find('.performance').exists()).toBe(false);
  });

  it('shows an empty state for empty and malformed responses', async () => {
    mockResponse = {};
    wrapper = mountWidget();
    await flushPromises();
    expect(wrapper.find('.empty-state').text()).toBe('No matching disclosures');
    expect(wrapper.findAll('.trade')).toHaveLength(0);
  });

  describe('configuration', () => {
    it('builds the endpoint from all supported filters', () => {
      wrapper = mountWidget({
        ticker: ' nvda ',
        member: 'Pelosi',
        chamber: 'house',
        transactionType: 'purchase',
        limit: 8,
      });
      expect(wrapper.vm.endpoint).toBe(
        'https://www.bargo.ai/free-apis/congress/v1/trades'
        + '?limit=8&ticker=NVDA&member=Pelosi&chamber=house&type=purchase',
      );
    });

    it('defaults to five disclosures and ignores invalid values', () => {
      wrapper = mountWidget({ chamber: 'all', transactionType: 'gift', limit: 99 });
      expect(wrapper.vm.endpoint)
        .toBe('https://www.bargo.ai/free-apis/congress/v1/trades?limit=5');
    });

    it('sends an optional API key in the X-Api-Key header', () => {
      wrapper = mountWidget({ apiKey: 'bargo_test' });
      expect(wrapper.vm.headers).toEqual({ 'X-Api-Key': 'bargo_test' });
      wrapper.unmount();
      wrapper = mountWidget();
      expect(wrapper.vm.headers).toBeNull();
    });

    it('refreshes every five minutes by default', () => {
      wrapper = mountWidget();
      expect(wrapper.vm.updateInterval).toBe(300000);
    });
  });
});
