import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import request from '@/utils/request';
import PublicIp from '@/components/Widgets/PublicIp.vue';

vi.mock('@/utils/request', () => ({ default: vi.fn() }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));

/* A keyless answer from api.internetdata.io, trimmed to the fields the widget reads */
const keyless = {
  ip: '8.8.8.8',
  location: { country: 'US', country_name: 'United States', timezone: 'America/Los_Angeles' },
  asn: { asn: 15169, name: 'Google LLC', domain: 'google.com' },
  company: { name: 'Google LLC', domain: 'google.com' },
};

/* With a key, the location also carries the city, region and coordinates */
const keyed = {
  ...keyless,
  location: {
    ...keyless.location,
    region: 'California',
    city: 'Mountain View',
    latitude: 37.38605,
    longitude: -122.08385,
  },
};

async function mount(options = {}) {
  const wrapper = shallowMount(PublicIp, {
    props: { options: { provider: 'internetdata', ...options } },
  });
  await flushPromises();
  return wrapper;
}

describe('PublicIp widget, internetdata provider', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('shows the IP, company and flag without a key, and no empty location', async () => {
    request.mockResolvedValue({ data: keyless });
    const wrapper = await mount();
    expect(request.mock.calls[0][0].url).toBe('https://api.internetdata.io/myip');
    expect(wrapper.find('.ip-address').text()).toBe('8.8.8.8');
    expect(wrapper.find('.isp-name').text()).toBe('Google LLC');
    expect(wrapper.find('.flag-image').attributes('src')).toBe('https://flagcdn.com/64x48/us.png');
    expect(wrapper.find('.ip-location').exists()).toBe(false);
  });

  it('adds the city, region and map link when a key is set', async () => {
    request.mockResolvedValue({ data: keyed });
    const wrapper = await mount({ apiKey: 'test-key' });
    expect(request.mock.calls[0][0].url).toBe('https://api.internetdata.io/myip?apikey=test-key');
    const location = wrapper.find('.ip-location');
    expect(location.text()).toBe('Mountain View, California');
    expect(location.attributes('href')).toContain('37.38605/-122.08385');
  });
});
