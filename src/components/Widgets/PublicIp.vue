<template>
<div class="ip-info-wrapper">
  <p class="ip-address" :class="{ 'is-long': ipAddr?.length > 16 }">{{ ipAddr }}</p>
  <div class="region-wrapper" v-if="!options.hideLocation">
    <img class="flag-image" v-if="flagImg" :src="flagImg" alt="Flag" />
    <div class="info-text">
      <p class="isp-name">{{ ispName }}</p>
      <a class="ip-location" v-if="location" :href="mapsUrl" title="🗺️ Open in Maps">
        {{ location }}
      </a>
    </div>
  </div>
</div>
</template>

<script>
import WidgetMixin from '@/mixins/WidgetMixin';
import { widgetApiEndpoints as urls } from '@/utils/config/defaults';
import { getCountryFlag, getMapUrl } from '@/utils/MiscHelpers';

/* List of providers, with their API endpoint and response structure/parser */
const PROVIDERS = {
  freeipapi: {
    url: urls.publicIp4,
    parse: (d) => ({
      ip: d.ipAddress,
      isp: d.asnOrganization,
      city: d.cityName,
      region: d.regionName,
      countryCode: d.countryCode,
      lat: d.latitude,
      lon: d.longitude,
    }),
  },
  ipinfo: {
    url: (key) => (key ? `${urls.publicIp5}?token=${key}` : urls.publicIp5),
    parse: (d) => {
      const [lat, lon] = (d.loc || ',').split(',');
      return {
        ip: d.ip,
        isp: d.org,
        city: d.city,
        region: d.region,
        countryCode: d.country,
        lat,
        lon,
      };
    },
  },
  ipquery: {
    url: urls.publicIp6,
    parse: (d) => ({
      ip: d.ip,
      isp: d.isp && (d.isp.org || d.isp.isp),
      city: d.location && d.location.city,
      region: d.location && d.location.state,
      countryCode: d.location && d.location.country_code,
      lat: d.location && d.location.latitude,
      lon: d.location && d.location.longitude,
    }),
  },
  internetdata: {
    url: (key) => (key ? `${urls.publicIp7}?apikey=${key}` : urls.publicIp7),
    parse: (d) => ({
      ip: d.ip,
      isp: d.company?.name || d.asn?.name,
      city: d.location?.city,
      region: d.location?.region,
      countryCode: d.location?.country,
      lat: d.location?.latitude,
      lon: d.location?.longitude,
    }),
  },
  'ip-api': {
    url: urls.publicIp3,
    parse: (d) => ({
      ip: d.query,
      isp: d.isp,
      city: d.city,
      region: d.regionName,
      countryCode: d.countryCode,
      lat: d.lat,
      lon: d.lon,
    }),
  },
  ipgeolocation: {
    url: (key) => `${urls.publicIp2}?apiKey=${key}`,
    requiresKey: true,
    parse: (d) => ({
      ip: d.ip,
      isp: d.organization || d.isp,
      city: d.city,
      region: d.state_prov,
      countryCode: d.country_code2,
      lat: d.latitude,
      lon: d.longitude,
    }),
  },
};

const REMOVED_PROVIDERS = ['ipapi.co', 'ifconfig.co', 'ip2location.io'];
const DEFAULT_PROVIDER = 'ipinfo';

export default {
  mixins: [WidgetMixin],
  computed: {
    provider() {
      const chosen = this.parseAsEnvVar(this.options.provider) || DEFAULT_PROVIDER;
      return PROVIDERS[chosen] ? chosen : null;
    },
    apiKey() {
      return this.parseAsEnvVar(this.options.apiKey);
    },
  },
  data() {
    return {
      ipAddr: null,
      location: null,
      ispName: null,
      flagImg: null,
      mapsUrl: null,
    };
  },
  methods: {
    /* Validate config, then fetch the user's IP from the selected provider */
    fetchData() {
      const raw = this.parseAsEnvVar(this.options.provider);
      if (raw && !PROVIDERS[raw]) {
        const note = REMOVED_PROVIDERS.includes(raw) ? 'depricated' : 'unknown';
        this.error(`Provider '${raw}' is ${note}. Pick one of: ${Object.keys(PROVIDERS).join(', ')}.`);
        return;
      }
      const { url, requiresKey } = PROVIDERS[this.provider];
      if (requiresKey && !this.apiKey) {
        this.error('Missing API Key');
        return;
      }
      this.makeRequest(typeof url === 'function' ? url(this.apiKey) : url).then(this.processData);
    },
    /* Normalise the response and assign to display fields */
    processData(ipInfo) {
      const parsed = PROVIDERS[this.provider].parse(ipInfo);
      if (!parsed.ip) {
        this.error(`Unexpected response from provider '${this.provider}'`);
        return;
      }
      this.ipAddr = parsed.ip;
      this.ispName = parsed.isp;
      this.location = [parsed.city, parsed.region].filter(Boolean).join(', ');
      this.flagImg = parsed.countryCode ? getCountryFlag(parsed.countryCode) : null;
      this.mapsUrl = (parsed.lat && parsed.lon)
        ? getMapUrl({ lat: parsed.lat, lon: parsed.lon }) : null;
    },
  },
};
</script>

<style scoped lang="scss">
.ip-info-wrapper {
  cursor: default;
  p.ip-address {
    font-size: 1.6rem;
    margin: 0.5rem auto;
    color: var(--widget-text-color);
    font-family: var(--font-monospace);
    &.is-long {
      font-size: 0.95rem;
      word-break: break-all;
    }
  }
  .region-wrapper {
    display: flex;
    align-items: center;
    img.flag-image {
      width: 2rem;
      border-radius: var(--curve-factor-small);
      margin: 0.25rem 0.5rem 0 0;
    }
    a.ip-location {
      font-size: 1rem;
      margin: 0;
      text-decoration: none;
      color: var(--widget-text-color);
      opacity: var(--dimming-factor);
      &:hover {
        text-decoration: underline;
      }
    }
    p.isp-name {
      font-size: 1rem;
      margin: 0.25rem 0 0 0;
      color: var(--widget-text-color);
    }
  }
}

</style>
