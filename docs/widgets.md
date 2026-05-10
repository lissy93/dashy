# Widgets

Dashy has support for displaying dynamic content in the form of widgets. There are several built-in widgets available out-of-the-box as well as support for custom widgets to display stats from almost any service with an API.

## Contents

- **[General Widgets](#general-widgets)**
  - [Clock](#clock)
  - [Weather](#weather)
  - [Weather Forecast](#weather-forecast)
  - [RSS Feed](#rss-feed)
  - [Image](#image)
  - [Public IP Address](#public-ip)
  - [IP Blacklist Checker](#ip-blacklist)
  - [Domain Monitor](#domain-monitor)
  - [Crypto Watch List](#crypto-watch-list)
  - [Crypto Price History](#crypto-token-price-history)
  - [Crypto Wallet Balance](#wallet-balance)
  - [Code Stats](#code-stats)
  - [Mullvad Status](#mullvad-status)
  - [Email Aliases (addy.io)](#addyio)
  - [Vulnerability Feed](#vulnerability-feed)
  - [Exchange Rates](#exchange-rates)
  - [Public Holidays](#public-holidays)
  - [Covid-19 Status](#covid-19-status)
  - [Sports Scores](#sports-scores)
  - [News Headlines](#news-headlines)
  - [TFL Status](#tfl-status)
  - [Stock Price History](#stock-price-history)
  - [ETH Gas Prices](#eth-gas-prices)
  - [Joke of the Day](#joke)
  - [Chuck Norris quotes](#chucknorris)
  - [XKCD Comics](#xkcd-comics)
  - [Flight Data](#flight-data)
  - [NASA APOD](#astronomy-picture-of-the-day)
  - [GitHub Trending](#github-trending)
  - [GitHub Profile Stats](#github-profile-stats)
  - [Healthchecks Status](#healthchecks-status)
  - [Hackernews Trending](#hackernews-trending)
  - [Mvg Departure](#mvg-departure)
  - [Mvg Connection](#mvg-connection)
  - [Custom search](#custom-search)
  - [Rescuetime overview](#rescuetime-overview)
  - [Minecraft Server](#minecraft-server)
- **[Self-Hosted Services Widgets](#self-hosted-services-widgets)**
  - [System Info](#system-info)
  - [Cron Monitoring](#cron-monitoring-health-checks)
  - [CPU History](#cpu-history-netdata)
  - [Memory History](#memory-history-netdata)
  - [System Load History](#load-history-netdata)
  - [Pi-Hole Stats](#pi-hole-stats)
  - [Pi-Hole Stats v6](#pi-hole-stats-v6)
  - [Pi-Hole Queries](#pi-hole-queries)
  - [Pi-Hole Queries v6](#pi-hole-queries-v6)
  - [Pi-Hole Recent Traffic](#pi-hole-recent-traffic)
  - [Pi-Hole Recent Traffic v6](#pi-hole-recent-traffic-v6)
  - [Stat Ping Statuses](#stat-ping-statuses)
  - [Synology Download Station](#synology-download-station)
  - [AdGuard Home Block Stats](#adguard-home-block-stats)
  - [AdGuard Home Filters](#adguard-home-filters)
  - [AdGuard Home DNS Info](#adguard-home-dns-info)
  - [AdGuard Home Top Domains](#adguard-home-top-domains)
  - [Nextcloud User](#nextcloud-user)
  - [Nextcloud User Statuses](#nextcloud-user-statuses)
  - [Nextcloud Notifications](#nextcloud-notifications)
  - [Nextcloud System](#nextcloud-system)
  - [Nextcloud Stats](#nextcloud-stats)
  - [Nextcloud PHP OPcache](#nextcloud-php-opcache-stats)
  - [Proxmox lists](#proxmox-lists)
  - [Sabnzbd](#sabnzbd)
  - [Gluetun VPN Info](#gluetun-vpn-info)
  - [Drone CI Build](#drone-ci-builds)
  - [Filebrowser](#filebrowser)
  - [Linkding](#linkding)
  - [Uptime Kuma](#uptime-kuma)
  - [Uptime Kuma Status Page](#uptime-kuma-status-page)
  - [Tactical RMM](#tactical-rmm)
- **[System Resource Monitoring](#system-resource-monitoring)**
  - [CPU Usage Current](#current-cpu-usage)
  - [CPU Usage Per Core](#cpu-usage-per-core)
  - [CPU Usage History](#cpu-usage-history)
  - [Memory Usage Current](#current-memory-usage)
  - [Memory Usage History](#memory-usage-history)
  - [Disk Space](#disk-space)
  - [Disk IO](#disk-io)
  - [System Load](#system-load)
  - [System Load History](#system-load-history)
  - [Network Interfaces](#network-interfaces)
  - [Network Traffic](#network-traffic)
  - [Resource Usage Alerts](#resource-usage-alerts)
  - [Public & Private IP](#ip-address)
  - [CPU Temperature](#cpu-temp)
  - [Compact Metrics](#compact-metrics)
- **[Dynamic Widgets](#dynamic-widgets)**
  - [Iframe Widget](#iframe-widget)
  - [HTML Embed Widget](#html-embedded-widget)
  - [API Response](#api-response)
  - [Prometheus Data](#prometheus-data)
  - [Data Feed](#data-feed)
- **[Usage & Customizations](#usage--customizations)**
  - [Widget Usage Guide](#widget-usage-guide)
  - [Continuous Updates](#continuous-updates)
  - [Proxying Requests](#proxying-requests)
  - [Handling Secrets](#handling-secrets)
  - [Setting Timeout](#setting-timeout)
  - [Adding Labels](#adding-labels)
  - [Ignoring Errors](#ignoring-errors)
  - [Custom CSS Styling](#widget-styling)
  - [Customizing Charts](#customizing-charts)
  - [Language Translations](#language-translations)
  - [Widget UI Options](#widget-ui-options)
  - [Building a Widget](#build-your-own-widget)
  - [Requesting a Widget](#requesting-a-widget)
  - [Troubleshooting](#troubleshooting-widget-errors)

## General Widgets

### Clock

A simple, live-updating time and date widget with time-zone support. All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/clock" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`timeZone`** | `string` |  _Optional_ | The time zone to display date and time in.<br> Specified as Region/City, for example: `Australia/Melbourne`. See the [Time Zone DB](https://timezonedb.com/time-zones) for a full list of supported TZs. Defaults to the browser / device's local time
**`format`** | `string` | _Optional_ | A country code for displaying the date and time in local format.<br>Specified as `[ISO-3166]-[ISO-639]`, for example: `en-AU`. See [here](https://www.fincher.org/Utilities/CountryLanguageList.shtml) for a full list of locales. Defaults to the browser / device's region
**`customCityName`** | `string` |  _Optional_ | By default the city from the time-zone is shown, but setting this value will override that text
**`hideDate`** | `boolean` |  _Optional_ | If set to `true`, the date and city will not be shown. Defaults to `false`
**`hideSeconds`** | `boolean` |  _Optional_ | If set to `true`, seconds will not be shown. Defaults to `false`
**`use12Hour`** | `boolean` |  _Optional_ | If set to `true`, 12 hour time will be displayed. Defaults to the settings suggested by the current `format` and `timeZone`

#### Example

```yaml
- type: clock
  options:
    timeZone: Europe/London
    format: en-GB
    hideDate: false
```

#### Info

_No external data requests._

---

### Weather

A simple, live-updating local weather component, showing temperature, conditions and more info.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/weather" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | Your OpenWeatherMap API key. You can get one for free at [openweathermap.org](https://openweathermap.org/)
**`city`** | `string` | Required | A city name to use for fetching weather. This can also be a state code or country code, following the ISO-3166 format
**`units`** | `string` |  _Optional_ | The units to use for displaying data, can be either `metric` or `imperial`. Defaults to `metric`
**`hideDetails`** | `boolean` |  _Optional_ | If set to `true`, the additional details (wind, humidity, pressure, etc) will not be shown. Defaults to `false`
**`lat`** | `number` |  _Optional_ | To show weather for a specific location, you can provide the latitude and longitude coordinates. If provided, this will override the `city` option
**`lon`** | `number` |  _Optional_ | To show weather for a specific location, you can provide the latitude and longitude coordinates. If provided, this will override the `city` option

#### Example

```yaml
- type: weather
  options:
    apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    city: London
    units: metric
    hideDetails: true
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan
- **Privacy**: _See [OWM Privacy Policy](https://openweather.co.uk/privacy-policy)_

---

### Weather Forecast

Displays the weather (temperature and conditions) for the next few days for a given location. Note that this requires either the free [OpenWeatherMap Student Plan](https://home.openweathermap.org/students), or the Premium Plan.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/weather-forecast" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | Your OpenWeatherMap API key. You can get one at [openweathermap.org](https://openweathermap.org/) or for free via the [OWM Student Plan](https://home.openweathermap.org/students)
**`city`** | `string` | Required | A city name to use for fetching weather. This can also be a state code or country code, following the ISO-3166 format
**`numDays`** | `number` |  _Optional_ | The number of days to display of forecast info to display. Defaults to `4`, max `16` days
**`units`** | `string` |  _Optional_ | The units to use for displaying data, can be either `metric` or `imperial`. Defaults to `metric`
**`hideDetails`** | `boolean` |  _Optional_ | If set to `true`, the additional details (wind, humidity, pressure, etc) will not be shown. Defaults to `false`

#### Example

```yaml
- type: weather-forecast
  options:
    city: California
    numDays: 6
    apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    units: imperial
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🔴 Premium (free for personal use only)
- **Privacy**: _See [OWM Privacy Policy](https://openweather.co.uk/privacy-policy)_

---

### RSS Feed

Display news and updates from any RSS-enabled service.

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/rss" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`rssUrl`** | `string` |  Required | The URL location of your RSS feed
**`apiKey`** | `string` |  _Optional_ | An API key for [rss2json](https://rss2json.com/). It's free, and will allow you to make 10,000 requests per day, you can sign up [here](https://rss2json.com/sign-up)
**`limit`** | `number` |  _Optional_ | The number of posts to return. If you haven't specified an API key, this will be limited to 10
**`orderBy`** | `string` |  _Optional_ | How results should be sorted. Can be either `pubDate`, `author` or `title`. Defaults to `pubDate`
**`orderDirection`** | `string` |  _Optional_ | Order direction of feed items to return. Can be either `asc` or `desc`. Defaults to `desc`
**`parseLocally`** | `boolean`     |  _Optional_ | If true parse the rss feed locally instead of using the rss2json API.

#### Example

```yaml
- type: rss-feed
  options:
    rssUrl: https://www.schneier.com/blog/atom.xml
    apiKey: xxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟠 Optional
- **Price**: 🟠 Free Plan (up to 10,000 requests / day)
- **Privacy**: _See [Rss2Json Privacy Policy](https://rss2json.com/privacy-policy)_

---

### Image

Displays an image.

This may be useful if you have a service (such as Grafana - [see example](https://mattionline.de/grafana-api-export-graph-as-png/)), which periodically exports charts or other data as an image.

You can also store images within Dashy's public directory (using a Docker volume), and reference them directly. E.g. `-v ./path/to/my-homelab-logo.png:/app/public/logo.png`, then in the widget `imagePath: /logo.png`.

Similarly, any web service that serves up widgets as image can be used. E.g. you could show current star chart for a GitHub repo, with: `imagePath: https://starchart.cc/Lissy93/dashy.svg`.

If you'd like to embed a live screenshot, of all or just part of a website, then this can be done using [API Flash](https://apiflash.com/).

Or what about showing a photo of the day? Try `https://source.unsplash.com/random/400x300` or `https://picsum.photos/400/300`

<p align="center"><img width="300" src="https://pixelflare.cc/alicia/dashy/image" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`imagePath`** | `string` |  Required | The path (local or remote) of the image to display
**`imageWidth`** | `string` |  _Optional_ | Specify a fixed width for rendered image. Accepts either integer value in `px`, or any string value with units (e.g. `420`, `100px`, `6.9rem`) (defaults to `auto`)
**`imageHeight`** | `string` |  _Optional_ | Specify a fixed height for rendered image. Accepts either integer value in `px`, or any string value with units (e.g. `420`, `100px`, `6.9rem`) (defaults to `auto`)

#### Example

```yaml
- type: image
  options:
    imagePath: https://i.ibb.co/yhbt6CY/dashy.png
```

#### Info

Unless image fetched from remote source, no external data request is made.

---

### Public IP

Displays your public IP address, ISP and approximate location.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/public-ip" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`provider`** | `string` |  _Optional_ | One of `ipinfo` _(default)_, `freeipapi`, `ipquery`, `ip-api`, or `ipgeolocation`. See the table below
**`apiKey`** | `string` |  _Optional_ | Required for `ipgeolocation`. Optional for `ipinfo` (a [free token](https://ipinfo.io/signup) raises the rate limit from ~1k/day to ~50k/month)
**`hideLocation`** | `boolean` |  _Optional_ | Set to `true` to hide the flag, ISP name and city/region — only the IP address is shown. Defaults to `false`

#### Example

Default (no options needed)

```yaml
- type: public-ip
```

Using `ip-api` via the proxy (gets server IP, because of `useProxy`)

```yaml
- type: public-ip
  useProxy: true
  options:
    provider: ip-api
```

Using `ipgeolocation` with a key:

```yaml
- type: public-ip
  options:
    provider: ipgeolocation
    apiKey: xxxxxxxxxxxxxxx
```

> [!TIP]
> Setting `useProxy: true` makes the lookup happen from Dashy's server instead of your browser, so the upstream API returns the public IP of the machine running Dashy, whereas without `useProxy` it will show your public IP.

#### Supported providers

**Provider** | **Key** | **Proxy** | **Notes**
--- | --- | --- | ---
`ipinfo` _(default)_ | 🟢 Not needed / 🟠 Optional | 🟢 Not needed | Service from [ipinfo.io](https://ipinfo.io/). Keyless gives ~1k/day; a [free token](https://ipinfo.io/signup) raises this to ~50k/month. Sometimes blocked by adblockers.
`freeipapi` | 🟢 Not needed | 🟢 Not needed | Keyless, 60 req/min via [freeipapi.com](https://freeipapi.com/).
`ipquery` | 🟢 Not needed | 🟢 Not needed | Modern keyless API from [ipquery.io](https://ipquery.io/). Includes VPN/Tor/datacenter risk flags in the raw response.
`ip-api` | 🟢 Not needed | 🔴 **Required** | [ip-api.com](https://ip-api.com/) is HTTP-only on the free tier, so the proxy is needed to avoid mixed-content errors.
`ipgeolocation` | 🔴 **Required** | 🟢 Not needed | Get a free key from [ipgeolocation.io](https://ipgeolocation.io/signup.html).


#### Info

- **CORS**: 🟢 Enabled (only `provider: ip-api` needs the proxy)
- **Auth**: 🟠 Optional (only `ipgeolocation` requires a key, and `ipinfo` is optional)
- **Price**: 🟢 Free
- **Host**: Managed Instance Only
- **Privacy**: See the policy for whichever provider you choose: [freeipapi.com](https://freeipapi.com/), [ipinfo.io](https://ipinfo.io/privacy-policy), [ipquery.io](https://ipquery.io/), [ip-api.com](https://ip-api.com/docs/legal), [IPGeoLocation](https://ipgeolocation.io/privacy.html).

---

### IP Blacklist

Notice certain web pages aren't loading? This widget quickly shows which blacklists your IP address (or host, or email) appears on, using data from [blacklistchecker.com](https://blacklistchecker.com/).

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/ip-blacklist" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`ipAddress`** | `string` |  _Optional_ | The IP to check. This can also be a domain/ host name or even an email address. If left blank, Dashy will use your current public IP address.
**`apiKey`** | `string` |  Required | You can get your free API key from [blacklistchecker.com](https://blacklistchecker.com/keys)

#### Example

```yaml
- type: blacklist-check
  options:
    apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ipAddress: 1.1.1.1
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free Plan
- **Host**: Managed Instance Only
- **Privacy**: _See [BlacklistChecker Privacy Policy](https://blacklistchecker.com/privacy)_

---

### Domain Monitor

Keep an eye on the expiry dates of your domain names, using public whois records fetched from [whoapi.com](https://whoapi.com/). Click the domain name to view additional info, like registrar, name servers and date last updated.

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/domain-monitor" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`domain`** | `string` |  Required | The domain to check
**`apiKey`** | `string` |  Required | You can get your free API key from [my.whoapi.com](https://my.whoapi.com/user/signup)
**`showFullInfo`** | `boolean` |  _Optional_ | If set to true, the toggle-full-info panel will be open by default

#### Example

```yaml
  - type: domain-monitor
    options:
      domain: example.com
      apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  - type: domain-monitor
    options:
      domain: example2.com
      apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🔴 Paid only, no free plan
- **Host**: Managed Instance Only
- **Privacy**: _See [WhoAPI Privacy Policy](https://whoapi.com/privacy-policy/)_

---

### Crypto Watch List

Keep track of price changes of your favorite crypto assets. Data is fetched from [CoinGecko](https://www.coingecko.com/). All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/crypto-prices" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`assets`** | `string` |  _Optional_ | An array of cryptocurrencies, coins and tokens. See [list of supported assets](https://api.coingecko.com/api/v3/asset_platforms). If none are specified, then the top coins by `sortBy` (defaults to market cap) will be returned
**`currency`** | `string` | _Optional_ | The fiat currency to display price in, expressed as an ISO-4217 alpha code (see [list of currencies](https://www.iban.com/currency-codes)). Defaults to `USD`
**`sortBy`** | `string` |  _Optional_ | The method of sorting results. Can be `marketCap`, `volume` or `alphabetical`. Defaults to `marketCap`.
**`limit`** | `number` |  _Optional_ | Number of results to return, useful when no assets are specified. Defaults to either `all` or `100`

#### Example

```yaml
- type: crypto-watch-list
  options:
    limit: 10
```

Or

```yaml
  - type: crypto-watch-list
    options:
      currency: GBP
      sortBy: marketCap
      assets:
      - bitcoin
      - ethereum
      - monero
      - cosmos
      - polkadot
      - dogecoin
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Privacy**: _See [CoinGecko Privacy Policy](https://www.coingecko.com/en/privacy)_

---

### Crypto Token Price History

Shows recent price history for a given crypto asset, using price data fetched from [CoinGecko](https://www.coingecko.com/)

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/crypto-price-history" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`asset`** | `string` |  Required | Name of a crypto asset, coin or token to fetch price data for, see [list of supported assets](https://api.coingecko.com/api/v3/asset_platforms)
**`currency`** | `string` | _Optional_ | The fiat currency to display results in, expressed as an ISO-4217 alpha code (see [list of currencies](https://www.iban.com/currency-codes)). Defaults to `USD`
**`numDays`** | `number` |  _Optional_ | The number of days of price history to render. Defaults to `7`, min: `1`, max: `30` days
**`chartColor`** | `string` | _Optional_ | Color of the chart value. Defaults to `--widget-text-color` which inherits dashboard primary color
**`chartHeight`** | `number` | _Optional_ | The height of rendered chart in px. Defaults to `300`

#### Example

```yaml
- type: crypto-price-chart
  options:
    asset: bitcoin
    currency: GBP
    numDays: 7
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Privacy**: _See [CoinGecko Privacy Policy](https://www.coingecko.com/en/privacy)_

---

### Wallet Balance

Keep track of your crypto balances and see recent transactions. Data is fetched from [BlockCypher](https://www.blockcypher.com/dev/)

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/crypto-wallet" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`coin`** | `string` |  Required | Symbol of coin or asset, e.g. `btc`, `eth` or `doge`
**`address`** | `string` | Required | Address to monitor. This is your wallet's **public** / receiving address
**`network`** | `string` |  _Optional_ | To use a different network, other than mainnet. Defaults to `main`
**`limit`** | `number` | _Optional_ | Limit the number of transactions to display. Defaults to `10`, set to large number to show all

#### Example

```yaml
- type: wallet-balance
  options:
    coin: btc
    address: 3853bSxupMjvxEYfwGDGAaLZhTKxB2vEVC
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Privacy**: _See [BlockCypher Privacy Policy](https://www.blockcypher.com/privacy.html)_

---

### Code Stats

Display your coding summary. [Code::Stats](https://codestats.net/) is a free and open source app that aggregates statistics about your programming activity. Dashy supports both the public instance, as well as self-hosted versions.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/code-stats" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`username`** | `string` |  Required | Your CodeStats username
**`hostname`** | `string` |  _Optional_ | If your self-hosting CodeStats, then supply the host name. By default it will use the public hosted instance
**`monthsToShow`** | `number` |  _Optional_ | Specify the number of months to render in the historical data chart. Defaults to `6`
**`hideMeta`** | `boolean` |  _Optional_ | Optionally hide the meta section (username, level, all-time and recent XP)
**`hideHistory`** | `boolean` |  _Optional_ | Optionally hide the historical calendar heat map
**`hideLanguages`** | `boolean` |  _Optional_ | Optionally hide the programming languages pie chart
**`hideMachines`** | `boolean` |  _Optional_ | Optionally hide the machines percentage chart

#### Example

```yaml
- type: code-stats
  options:
    username: alicia
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted or Managed
- **Privacy**: _See [Code::Stats Privacy Policy](https://codestats.net/tos#privacy)_

---

### Mullvad Status

Shows your Mullvad VPN connection status, as well as server info. Fetched from [am.i.mullvad.net](https://mullvad.net/en/check/)

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/mullvad" /></p>

#### Options

_No Options._

#### Example

```yaml
- type: mullvad-status
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed
- **Privacy**: _See [Mullvad Privacy Policy](https://mullvad.net/en/help/privacy-policy/)_

---

### addy.io

[addy.io](https://addy.io/) is a free and open source mail forwarding service. Use it to protect your real email address, by using a different alias for each of your online accounts, and have all emails land in your normal inbox(es). Supports custom domains, email replies, PGP-encryption, multiple recipients and more

This widget display email addresses / aliases from addy.io. Click an email address to copy to clipboard, or use the toggle switch to enable/ disable it. Shows usage stats (bandwidth, used aliases etc), as well as total messages received, blocked and sent. Works with both self-hosted and managed instances of addy.io.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/addy" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | Your addy.io API Key / Personal Access Token. You can generate this under [API Settings](https://app.addy.io/settings/api)
**`hostname`** | `string` |  _Optional_ | If your self-hosting addy.io, then supply the host name. By default it will use the public hosted instance
**`apiVersion`** | `string` |  _Optional_ | If you're using an API version that is not version `v1`, then specify it here
**`limit`** | `number` |  _Optional_ | Limit the number of emails shown per page. Defaults to `10`
**`sortBy`** | `string` |  _Optional_ | Specify the sort order for email addresses. Defaults to `updated_at`. Can be either: `local_part`, `domain`, `email`, `emails_forwarded`, `emails_blocked`, `emails_replied`, `emails_sent`, `created_at`, `updated_at` or `deleted_at`. Precede with a `-` character to reverse order.
**`searchTerm`** | `string` |  _Optional_ | A search term to filter results by, will search the email, description and domain
**`disableControls`** | `boolean` |  _Optional_ | Prevent any changes being made to account through the widget. User will not be able to enable or disable aliases through UI when this option is set
**`hideMeta`** | `boolean` |  _Optional_ | Don't show account meta info (forward/ block count, quota usage etc)
**`hideAliases`** | `boolean` |  _Optional_ | Don't show email address / alias list. Will only show account meta info

#### Example

```yaml
  - type: addy
    options:
      apiKey: "xxxxxxxxxxxxxxxxxxxxxxxx\
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      limit: 5
      sortBy: created_at
      disableControls: true
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free for Self-Hosted / Free Plan available on managed instance or $1/month for premium
- **Host**: Self-Hosted or Managed
- **Privacy**: _See [addy.io Privacy Policy](https://addy.io/privacy/)_

---

### Vulnerability Feed

Keep track of recent security advisories and vulnerabilities, with optional filtering by score, exploits, vendor and product. Using data from [NIST Vulnerability API](https://nvd.nist.gov/developers/vulnerabilities). All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/cve" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`cveTag`** | `string` |  _Optional_ | This parameter returns only the CVE records that include the provided cveTag. Options are **disputed**, **unsupported-when-assigned** or **exclusively-hosted-service**
**`limit`** | `number` |  _Optional_ | The number of results to fetch. Can be between `5` and `30`, defaults to `5`
**`cvssV2Severity`** | `string` |  _Optional_ | This parameter returns only the CVEs that match the provided CVSSv2 qualitative severity rating. Options are **LOW**, **MEDIUM**, **HIGH** or **CRITICAL**
**`cvssV3Severity`** | `string` |  _Optional_ | This parameter returns only the CVEs that match the provided CVSSv3 qualitative severity rating. Options are **LOW**, **MEDIUM**, **HIGH** or **CRITICAL**
**`cvssV4Severity`** | `string` |  _Optional_ | This parameter returns only the CVEs that match the provided CVSSv4 qualitative severity rating. Options are **LOW**, **MEDIUM**, **HIGH** or **CRITICAL**
**`keywordSearch`** | `string` |  _Optional_ | This parameter returns only the CVEs where a word or phrase is found in the current description
**`apiKey`** | `string` |  _Optional_ | Without a key you're limited to 5 requests every 30 seconds. You can get a free API key from [here](https://nvd.nist.gov/developers/request-an-api-key)

#### Example

```yaml
- type: cve-vulnerabilities
```

or

```yaml
- type: cve-vulnerabilities
  options:
    cveTag: disputed
    cvssV2Severity: CRITICAL
    limit: 30
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Not Required (free apiKey recommended for multiple widgets)
- **Price**: 🟢 Free
- **Host**: Managed
- **Privacy**: _See [CVE Details Privacy Policy](https://www.cvedetails.com/privacy.php)_

---

### Exchange Rates

Display current FX rates in your native currency. Hover over a row to view more info, or click to show rates in that currency.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/currencies" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`inputCurrency`** | `string` | Required | The base currency to show results in. Specified as a 3-letter ISO-4217 code, see [here](https://www.exchangerate-api.com/docs/supported-currencies) for the full list of supported currencies, and their symbols
**`outputCurrencies`** | `array` |  Required | List or currencies to show results for. Specified as a 3-letter ISO-4217 code, see [here](https://www.exchangerate-api.com/docs/supported-currencies) for the full list of supported currencies, and their symbols
**`apiKey`** | `string` |  Required | API key for [exchangerate-api.com](https://www.exchangerate-api.com/), usually a 24-digit alpha-numeric string. You can sign up for a free account [here](https://app.exchangerate-api.com/sign-up)

#### Example

```yaml
- type: exchange-rates
  options:
    apiKey: xxxxxxxxxxxxxxxxxxxxxxxx
    inputCurrency: GBP
    outputCurrencies:
      - USD
      - JPY
      - HKD
      - KPW
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan (up to 100,000 requests/ month)
- **Host**: Managed Instance Only
- **Privacy**: _See [ExchangeRateAPI Privacy Policy](https://www.exchangerate-api.com/terms)_

---

### Public Holidays

Counting down to the next day off work? This widget displays upcoming public holidays for your country. Data is fetched from [Enrico](http://kayaposoft.com/enrico/)

Note, config for this widget is case-sensitive (see [#1268](https://github.com/Lissy93/dashy/issues/1268))

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/holidays" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`country`** | `string` |  Required | The country to fetch holiday data for, specified as a country code, e.g. `GB` or `US`
**`state`** | `string` |  **Optional** | restrict a country to a specific state defined by [ISO_3166-2](https://en.wikipedia.org/wiki/ISO_3166-2), e.g. `LND`.
**`holidayType`** | `string` |  **Optional** | The type of holidays to fetch. Can be: `all`, `public_holiday`, `observance`, `school_holiday`, `other_day` or `extra_working_day`. Defaults to `public_holiday`
**`monthsToShow`** | `number` |  **Optional** | The number of months in advance to show. Min: `1`, max: `24`. Defaults to `12`
**`lang`** | `string` |  **Optional** | The language in which the events should be. Usually local languages and english are available. Default to first available in the country. e.g. `en` or `fr`.

#### Example

```yaml
- type: public-holidays
  options:
    country: GB
    state: LND
    holidayType: all
    monthsToShow: 12
    lang: en
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [jurajmajer/enrico](https://github.com/jurajmajer/enrico)) or Managed
- **Privacy**: ⚫ No Policy Available

---

### Covid-19 Status

Keep track of the current COVID-19 status. Optionally also show cases by country, and a time-series chart. Uses live data from various sources, computed by [disease.sh](https://disease.sh/)

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/covid" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`showChart`** | `boolean` | _Optional_ | Also display a time-series chart showing number of recent cases
**`showCountries`** | `boolean` |  _Optional_ | Also display a list of cases per country
**`numDays`** | `number` | _Optional_ | Specify number of days worth of history to render on the chart
**`countries`** | `string[]` | _Optional_ | An array of countries to display, specified by their [ISO-3 codes](https://www.iso.org/obp/ui). Leave blank to show all, sorted by most cases. `showCountries` must be set to `true`
**`limit`** | `number` | _Optional_ | If showing all countries, set a limit for number of results to return. Defaults to `10`, no maximum

#### Example

```yaml
- type: covid-stats
```

Or

```yaml
- type: covid-stats
  options:
    showChart: true
    showCountries: true
    countries:
    - GBR
    - USA
    - IND
    - RUS
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [disease-sh/api](https://github.com/disease-sh/api))
- **Privacy**: ⚫ No Policy Available
- **Conditions**: [Terms of Use](https://github.com/disease-sh/api/blob/master/TERMS.md)

---

### Sports Scores

Show recent scores and upcoming matches from your favorite sports team. Data is fetched from [TheSportsDB.com](https://www.thesportsdb.com/). From the UI, you can click any other team to view their scores and upcoming games, or click a league name to see all teams.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/sports" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`teamId`** | `string` |  **Optional** | The ID of a team to fetch scores from. You can search for your team on the [Teams Page](https://www.thesportsdb.com/teams_main.php)
**`leagueId`** | `string` |  **Optional** | Alternatively, provide a league ID to fetch all games from. You can find the ID on the [Leagues Page](https://www.thesportsdb.com/Sport/Leagues)
**`pastOrFuture`** | `string` |  **Optional** | Set to `past` to show scores for recent games, or `future` to show upcoming games. Defaults to `past`. You can change this within the UI
**`apiKey`** | `string` | **Optional** | Optionally specify your API key, which you can sign up for at [TheSportsDB.com](https://www.thesportsdb.com/)
**`limit`** | `number` | **Optional** | To limit output to a certain number of matches, defaults to `15`
**`hideImage`** | `boolean` | **Optional** | Set to `true` to not render the team / match banner image, defaults to `false`

#### Example

```yaml
- type: sports-scores
  options:
    teamId: 133636
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟠 Optional
- **Price**: 🟠 Free plan (up to 30 requests / minute, limited endpoints)
- **Host**: Managed Instance Only
- **Privacy**: ⚫ No Policy Available

---

### News Headlines

Displays the latest news, click to read full article. Date is fetched from various news sources using [Currents API](https://currentsapi.services/en)

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/news" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | Your API key for CurrentsAPI. This is free, and you can [get one here](https://currentsapi.services/en/register)
**`country`** | `string` | _Optional_ | Fetch news only from a certain country or region. Specified as a country code, e.g. `GB` or `US`. See [here](https://api.currentsapi.services/v1/available/regions) for a list of supported regions
**`category`** | `string` | _Optional_ | Only return news from within a given category, e.g. `sports`, `programming`, `world`, `science`. The [following categories](https://api.currentsapi.services/v1/available/categories) are supported
**`lang`** | `string` |  _Optional_ | Specify the language for returned articles as a 2-digit ISO code (limited article support). The [following languages](https://api.currentsapi.services/v1/available/languages) are supported, defaults to `en`
**`count`** | `number` |  _Optional_ | Limit the number of results. Can be between `1` and `200`, defaults to `10`
**`keywords`** | `string` |  _Optional_ | Only return articles that contain an exact match within their title or description
**`hideImages`** | `boolean` |  _Optional_ | If set to `true`, then article image thumbnails will not be displayed

#### Example

```yaml
- type: news-headlines
    options:
      apiKey: xxxxxxx
      category: world
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan (up to 600 requests / day)
- **Host**: Managed Instance Only
- **Privacy**: _See [CurrentsAPI Privacy Policy](https://currentsapi.services/privacy)_

---

### TFL Status

Shows real-time tube status of the London Underground. All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/tfl" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`showAll`** | `boolean` |  _Optional_ | By default, details for lines with a Good Service are not visible, but you can click More Details to see all. Setting this option to `true` will show all lines on initial page load
**`sortAlphabetically`** | `boolean` | _Optional_ | By default lines are sorted by current status, set this option to `true` to instead sort them alphabetically
**`linesToShow`** | `array` | _Optional_ | By default all lines are shown. If you're only interested in the status of a few lines, then pass in an array of lines to show, specified by name

#### Example

```yaml
- type: tfl-status
```

```yaml
  - type: tfl-status
    options:
      showAll: true
      sortAlphabetically: true
      linesToShow:
      - District
      - Jubilee
      - Central
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance Only
- **Privacy**: _See [TFL Privacy Policy](https://tfl.gov.uk/corporate/privacy-and-cookies/)_

---

### Stock Price History

Shows recent price history for a given publicly-traded stock or share

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/stocks" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | API key for [Alpha Vantage](https://www.alphavantage.co/), you can get a free API key [here](https://www.alphavantage.co/support/#api-key)
**`stock`** | `string` | Required | The stock symbol for the asset to fetch data for
**`priceTime`** | `string` |  _Optional_ | The time to fetch price for. Can be `high`, `low`, `open` or `close`. Defaults to `high`
**`chartColor`** | `string` | _Optional_ | Color of the chart value. Defaults to `--widget-text-color` which inherits dashboard primary color
**`chartHeight`** | `number` | _Optional_ | The height of rendered chart in px. Defaults to `300`

#### Example

```yaml
- type: stock-price-chart
  options:
    stock: NET
    apiKey: PGUWSWD6CZTXMT8N
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan (up to 500 requests/day)
- **Host**: Managed Instance Only
- **Privacy**: _See [AlphaVantage Privacy Policy](https://www.alphavantage.co/privacy/)_

---

### ETH Gas Prices

Renders the current Gas cost of transactions on the Ethereum network (in both GWEI and USD), along with recent historical prices. Useful for spotting a good time to transact. Uses data from [ethgas.watch](https://ethgas.watch/)

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/eth-gas" /></p>

#### Options

_No config options._

#### Example

```yaml
- type: eth-gas-prices
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [wslyvh/ethgaswatch](https://github.com/wslyvh/ethgaswatch))
- **Privacy**: ⚫ No Policy Available

---

### Joke

Renders a programming or generic joke. Data is fetched from the [JokesAPI](https://github.com/Sv443/JokeAPI) by @Sv443. All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/joke" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`category`** | `string` |  _Optional_ | Set the category of jokes to return. Use a string to specify a single category, or an array to pass in multiple options. Available options are: `all`, `programming`, `pun`, `dark`, `spooky`, `christmas` and `misc`. An up-to-date list of supported categories can be found [here](https://v2.jokeapi.dev/categories). Defaults to `all`
**`safeMode`** | `boolean` | _Optional_ | Set to `true`, to prevent the fetching of any NSFW jokes. Defaults to `false`
**`language`** | `string` |  _Optional_ | Specify the language for returned jokes. The following languages are supported: `en`, `cs`, `de`, `es`, `fr` and `pt`, and an up-to-date list of supported languages can be found [here](https://v2.jokeapi.dev/languages). By default, your system language will be used, if it's supported, otherwise English

#### Example

```yaml
- type: joke
  options:
    safeMode: true
    language: en
    category: Programming
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [Sv443/JokeAPI](https://github.com/Sv443/JokeAPI))
- **Privacy**: _See [SV443's Privacy Policy](https://sv443.net/privacypolicy/en)_

---

### Chuck Norris quotes

Renders a Chuck Norris quote. Data is fetched from the [ChuckNorrisAPI](https://api.chucknorris.io/) by @matchilling. All fields are optional.

<p align="center"><img width="400" src="https://tbd" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`categories`** | `string` |  _Optional_ | Set the category of jokes to return. Use a string to specify a single category, or an array to pass in multiple options. Available options are: `animal`,`career`,`celebrity`,`dev`,`explicit`,`fashion`,`food`,`history`,`money`,`movie`,`music`,`political`,`religion`,`science`,`sport` and `travel`. An up-to-date list of supported categories can be found [here](https://api.chucknorris.io/jokes/categories). Defaults to not explicitely set and therefore any of the categories can come up.

#### Example

```yaml
- type: chucknorris
  options:
    categories: history,sport
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance
- **Privacy**: _See [matchilling's Privacy Policy](https://api.chucknorris.io/privacy)_

---

### XKCD Comics

Have a laugh with the daily comic from [XKCD](https://xkcd.com/). A classic webcomic website covering everything from Linux, math, romance, science and language. All fields are optional.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/xkcd" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`comic`** | `string / number` |  _Optional_ | Choose which comic to display. Set to either `random`, `latest` or the series number of a specific comic, like `627`. Defaults to `latest`

#### Example

```yaml
- type: xkcd-comic
  options:
    comic: latest
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Privacy**: ⚫ No Policy Available

---

### Flight Data

Displays airport departure and arrival flights, using data from [AeroDataBox](https://www.aerodatabox.com/). Useful if you live near an airport and often wonder where the flight overhead is going to. Hover over a row for more flight data.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/flights" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`airport`** | `string` |  Required | The airport to show flight data from. Should be specified as a 4-character ICAO-code, a full list of which can be found [here](https://en.wikipedia.org/wiki/ICAO_airport_code) (example: `KBJC` or `EGKK`)
**`apiKey`** | `string` | Required | A valid [RapidAPI](https://rapidapi.com/) Key, with [AeroDataBox](https://rapidapi.com/aerodatabox/api/aerodatabox/) enabled (check in your [Subscription Dashboard](https://rapidapi.com/developer/billing/subscriptions-and-usage)). This API is free to sign up for and use
**`limit`** | `number` | _Optional_ | For busy airports, you may wish to limit the number of results visible
**`direction`** | `string` | _Optional_ | By default, both departure and arrival flights will be fetched, if you would like to only show flights in one direction, set this to wither `departure` or `arrival`

#### Example

```yaml
- type: flight-data
  options:
    airport: EGLC
    apiKey: XXXXX
    limit: 12
    direction: all
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan (up to 150 requests / month)
- **Host**: Managed Instance Only
- **Privacy**: _See [AeroDataBox](https://www.aerodatabox.com/#h.p_CXtIYZWF_WQd) and [RapidAPI Policy](https://rapidapi.com/privacy/)_

---

### Astronomy Picture of the Day

Show the NASA Astronomy Picture of the Day. Data is fetched from [APOD](https://apod.nasa.gov/apod/) using [@Lissy93/go-apod](https://github.com/lissy93/go-apod) / hosted at [apod.as93.net](https://apod.as93.net/).

<p align="center"><img width="400" src="https://storage.googleapis.com/as93-screenshots/dashy/apod.png" /></p>

#### Options

_No config options._

#### Example

```yaml
- type: apod
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [@Lissy93/go-apod](https://github.com/lissy93/go-apod))
- **Privacy**: _See [NASA's Privacy Policy](https://www.nasa.gov/about/highlights/HP_Privacy.html)_

---

### GitHub Trending

Displays currently trending projects on GitHub. Optionally specify a language and time-frame. Data is fetched from [Lissy93/gh-trending-no-cors](https://github.com/Lissy93/gh-trending-no-cors) using the GitHub API. All fields are optional.

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/github-trending" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`lang`** | `string` |  _Optional_ | A programming language to fetch trending repos from that category. E.g. `javascript` or `go`
**`since`** | `string` |  _Optional_ | The timeframe to use when calculating trends. Can be either `daily`, `weekly` or `monthly`. Defaults to `daily`
**`limit`** | `number` |  _Optional_ | Optionally limit the number of results. Max `25`, default is `10`

#### Example

```yaml
- type: github-trending-repos
  options:
    limit: 8
    since: weekly
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [Lissy93/gh-trending-no-cors](https://github.com/Lissy93/gh-trending-no-cors))
- **Privacy**: _See [GitHub's Privacy Policy](https://docs.github.com/en/github/site-policy/github-privacy-statement)_

---

### GitHub Profile Stats

Display stats from your GitHub profile, using embedded cards from [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/github-stats" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`username`** | `string` |  Required | The GitHub username to fetch info for. E.g. `lissy93`. (Not required if `hideProfileCard` and `hideLanguagesCard` are both set to `true`)
**`hideProfileCard`** | `boolean` |  _Optional_ | If set to `true`, the users profile card will not be shown. Defaults to `false`
**`hideLanguagesCard`** | `boolean` |  _Optional_ | If set to `true`, the users top languages card will not be shown. Defaults to `false`
**`repos`** | `array` |  _Optional_ | If you'd like to also display stats for some GitHub repositories, then add an array or repo names here. Specified as `[username]/[repo-name]`, e.g. `lissy93/dashy`

#### Example

```yaml
- type: github-profile-stats
  options:
    username: Lissy93
    hideLanguagesCard: true
    repos:
    - lissy93/dashy
    - lissy93/personal-security-checklist
    - lissy93/twitter-sentiment-visualisation
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Managed Instance or Self-Hosted (see [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats))
- **Privacy**: _See [GitHub's Privacy Policy](https://docs.github.com/en/github/site-policy/github-privacy-statement)_

---

### HealthChecks Status

Display status of one or more HealthChecks project(s). Works with healthchecks.io and your selfhosted instance.

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/healthchecks" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Optional | The base url of your instance, default is `https://healthchecks.io`
**`apiKey`** | `string` or `array` |  Required | One or more API keys for your healthcheck projects. (Read-only works fine)

```yaml
- type: HealthChecks
  options:
    host: https://healthcheck.your-domain.de
    apiKey: 
      - abcdefg...
      - zxywvu...
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Required
- **Price**: 🟢 Free / Paid / Self-hosted 
- **Host**: Managed Instance or Self-Hosted (see [healthchecks/healthchecks](https://github.com/healthchecks/healthchecks))
- **Privacy**: _See [Healthchecks.io Privacy Policy](https://healthchecks.io/privacy/)_

---

### Hackernews Trending

Display new and trending Posts from Hackernews

#### Options
**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`stories`** | `string` |  _Optional_ | HN Stories to display defaults to `topstories`. Options are: `beststories`, `topstories` or `newstories`
**`limit`** | `int` |  _Optional_ | The size of the list of Posts to show.

##### Example

```yaml
- type: hackernews-trending
  options:
    stories: newstories
    limit: 10
```

---

### MVG Departure

Display departure time of a MVG (Münchner Verkehrs Gesellschaft) station.

From https://www.mvg.de/impressum.html:

> [...] Die Verarbeitung unserer Inhalte oder Daten durch Dritte erfordert unsere ausdrückliche Zustimmung. Für private, nicht-kommerzielle Zwecke, wird eine gemäßigte Nutzung ohne unsere ausdrückliche Zustimmung geduldet. Jegliche Form von Data-Mining stellt keine gemäßigte Nutzung dar.[...]

In other words: Private, noncomercial, moderate use of the API is tolerated. They don’t consider data mining as moderate use. (This is not a legal advice)

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`location`** | `string` |  Required | The name of the location (exact) or the location id, startin with `de:09162:`
**`limit`** | `integer` |  _Optional_ | Limit number of entries, defaults to 10.
**`title`** | `string` |  _Optional_ | A custom title to be displayed.
**`header`** | `bool` |  _Optional_ | Shall the title be shown?
**`filters`** | `object` |  _Optional_ | Filter results
**`filters.line`** | `string/array` |  _Optional_ | Filter results for given line(s).
**`filters.product`** | `string/array` |  _Optional_ | Filter results for specific product (TRAM, UBAHN, SBAHN, BUS).
**`filters.destination`** | `string/object` |  _Optional_ | Filter results for specific destination(s)

```yaml
- type: mvg
  options:
    location: Marienplatz
    limit: 5
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free / Private use only
- **Host**: [MVG](https://mvg.de)
- **Privacy**: _See [MVG Datenschutz](https://www.mvg.de/datenschutz-mvg.html)_

---

### MVG Connection

Display the next connection for two addresses/coordinates, stations or POI within Munich using MVG MVG (Münchner Verkehrs Gesellschaft).

From https://www.mvg.de/impressum.html:

> [...] Die Verarbeitung unserer Inhalte oder Daten durch Dritte erfordert unsere ausdrückliche Zustimmung. Für private, nicht-kommerzielle Zwecke, wird eine gemäßigte Nutzung ohne unsere ausdrückliche Zustimmung geduldet. Jegliche Form von Data-Mining stellt keine gemäßigte Nutzung dar.[...]

In other words: Private, noncomercial, moderate use of the API is tolerated. They don’t consider data mining as moderate use. (This is not a legal advice)

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`origin`** | `string` |  Required | Origin of the connection.
**`destination`** | `string` |  Required | Destination of the connection.
**`title`** | `string` |  _Optional_ | A custom title to be displayed.
**`header`** | `bool` |  _Optional_ | Shall the title be shown?
**`filters`** | `object` |  _Optional_ | Filter results
**`filters.line`** | `string/array` |  _Optional_ | Filter results for given line(s).
**`filters.product`** | `string/array` |  _Optional_ | Filter results for specific product (TRAM, UBAHN, SBAHN, BUS).
**`filters.destination`** | `string/object` |  _Optional_ | Filter results for specific destination(s)

```yaml
- type: mvg-connection
  options:
    from: Marienplatz
    from: Dachauer Straße 123
    header: true
    filters:
      product: [UBAHN]
      line: [U1,U2,U4,U5]

```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free / Private use only
- **Host**: [MVG](https://mvg.de)
- **Privacy**: _See [MVG Datenschutz](https://www.mvg.de/datenschutz-mvg.html)_

---

### Custom List

Renders custom schema-compliant JOSN  in a list.

#### Options
**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`url`** | `text` |  Required | A string containing the url of a json file.
**`title`** | `text` |  optional | A title for the widget. Can be helpful if stacking multiple lists in the same section.
**`daysForNew`** | `number` |  Optional | Used to highlight new items.

#### Json Schema
The input file should comply with the following schema:
```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "link": {
          "type": "object",
          "properties": {
            "text": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "title": {
              "type": "string"
            }
          },
          "required": [
            "text",
            "url",
            "title"
          ]
        },
        "value": {
          "type": "object",
          "properties": {
            "text": {
              "type": "string"
            },
            "title": {
              "type": "string"
            }
          },
          "required": [
            "text",
            "title"
          ]
        },
        "date": {
          "type": "string"
        }
      },
      "required": [
        "link",
        "value",
        "date"
      ]
    }
  ]
}
```

Example: This json data was generated by a data worflow that gets the new releases of a few projects from GitHub. The system used to build the data workflow is n8n.

```json
[
    {
        "link": {
            "text": "jellyfin/jellyfin",
            "url": "https://github.com/jellyfin/jellyfin/releases/tag/v10.10.7",
            "title": ""
        },
        "value": {
            "text": "v10.10.7",
            "title": "2025-04-05"
        },
        "date": "2025-04-05T19:14:59Z"
    },
    {
        "link": {
            "text": "jellyfin/jellyfin-web",
            "url": "https://github.com/jellyfin/jellyfin-web/releases/tag/v10.10.7",
            "title": ""
        },
        "value": {
            "text": "v10.10.7",
            "title": "2025-04-05"
        },
        "date": "2025-04-05T19:15:00Z"
    },
    {
        "link": {
            "text": "lissy93/dashy",
            "url": "https://github.com/Lissy93/dashy/releases/tag/3.1.1",
            "title": ""
        },
        "value": {
            "text": "3.1.1",
            "title": "2024-05-30"
        },
        "date": "2024-05-30T17:20:53Z"
    },
    {
        "link": {
            "text": "VSCodium/vscodium",
            "url": "https://github.com/VSCodium/vscodium/releases/tag/1.102.14746",
            "title": ""
        },
        "value": {
            "text": "1.102.14746",
            "title": "2025-07-16"
        },
        "date": "2025-07-16T18:27:49Z"
    }
]
```
#### Notes
- This widget is designed to render data generated by another system that complies with the schema. The example JSON data above was generated using a n8n workflow, and other ETL or workflow systems can generate similar results.
- To avoid requests to a different system in each refresh, you can save the input files locally in the user-data folder inside your Dashy installation.
- To use json files from a different domain, remember to add `useProxy: true` to the widget configuration. I have not tested this use case because I save all my input data locally on the Dashy server. Please open a ticket if you have an issue in this use case.
 
#### Example

This widget renders a json file that from a `json-data` directory inside the `user-data` directory on the Dashy server.
```yaml
  - type: custom-list
    options:
      url: /json-data/github-releases.json
      title: 'Github Releases'
      daysForNew: 5
```

#### Info

- **CORS**: 🟢 Not needed for files hosted inside the `user-data` directory. Use `useProxy: true` to bypass CORS restrictions when using data from a different server.
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free 
- **Host**: user defined
- **Privacy**: depends on the user defined host.

---

### Custom search

Allows web search using multiple user-defined search engines and other websites.

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`engines`** | `array` |  required | An array of search engine objects. Each search engine object should have two required properties: **title** and **url**. See the example below.
**`placeholder`** | `string` |  optional | Placeholder text in the search box.
**`openingMethod`** | `string` |  optional | Open search in one of `newtab`, `sametab` or `workspace`.

#### Notes
- The first search engine in the engines array will be treated as the default search engine, and used when the user presses `Enter` in the search box.
- Popup blockers can interfere with opening a new search window.

#### Example

This widget allows searching multiple search engines from dashy.
```yaml
  - type: 'custom-search'
    options:
      placeholder: Search for something using the buttons below
      engines:
      - title: SearXNG
        url: https://searx.lan/?q=
      - title: Quant
        url: https://www.qwant.com/?q=
      - title: Bing Web
        url: http://www.bing.com/search?q=
      - title: Bing Images
        url: http://www.bing.com/images/search?q=
      - title: Bing Maps
        url: http://www.bing.com/maps/search?q=
      - title: Yandex
        url: https://www.yandex.com/search/?text=
      - title: Passmark
        url: https://www.passmark.com/search/zoomsearch.php?zoom_query=
      - title: IMDB
        url: http://www.imdb.com/find?q=
```
#### Info

- **CORS**: 🟢 Not needed
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free 
- **Host**: user defined
- **Privacy**: depends on the user defined search engines.

---

### RescueTime Overview

Show an overview of how you have spent your time for the current day.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/rescue-time" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  required | The API-Key generated in the RescueTime UI.


#### Example

```yaml
  - type: rescue-time
    useProxy: true
    options:
      apiKey: abcdefghijkl_mnop
```
#### Info

- **CORS**: 🟢 Required
- **Auth**: 🔴 Required
- **Price**: 🟠 Depends on user subscription 
- **Host**: [RescueTime](https://www.rescuetime.com)
- **Privacy**: _See [RescueTime Privacy](https://www.rescuetime.com/privacy)_

---

### Minecraft Server

Show minecraft server status

<p align="center"><img width="380" src="https://i.ibb.co/hcmd4Wf/minecraft-widget.png" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`title`**       | `string`  | _Optional_ | Display title for server uses server address if not set.
**`server`**      | `string`  | Required   | Server hostname or ip(:port) will use srv records.
**`bedrock`**     | `boolean` | _Optional_ | If server is a bedrock edition server. (default false)
**`showMods`**    | `boolean` | _Optional_ | Display mod list if available
**`showPlayers`** | `boolean` | _Optional_ | Display player list if available
**`showPlugins`** | `boolean` | _Optional_ | Display plugin list if available

#### Example

```yaml
  - type: minecraft-status
    options:
      title: Venity Network
      server: play.venitymc.com
      bedrock: true
      showMods: true
      showPlayers: true
      showPlugins: true
```
#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free 
- **Host**: [Minecraft Server Status](https://mcsrvstat.us/)
- **Privacy**: _See [Minecraft Server Status FAQ](https://mcsrvstat.us/faq)_

---



## Self-Hosted Services Widgets

### System Info
_See [MVG Datenschutz](https://www.mvg.de/datenschutz-mvg.html)_
Displays info about the server which Dashy is hosted on. Includes user + host, operating system, uptime and basic memory & load data.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/system-info" /></p>

#### Options

_No config options._

#### Example

```yaml
- type: system-info
```

#### Info

No external data requests made

Note that this widget is not available if you are running Dashy in a container or VM. Instead you can use the [System Monitoring](#system-resource-monitoring) widgets to display stats from the host system instead.

---

### Cron Monitoring (Health Checks)

Cron job monitoring using [Health Checks](https://github.com/healthchecks/healthchecks). Both managed and self-hosted instances are supported.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/cron-monitor" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`apiKey`** | `string` |  Required | A read-only API key for the project to monitor. You can generate this by selecting a Project --> Settings --> API Access. Note that you must generate a separate key for each project
**`host`** | `string` | _Optional_ | If you're self-hosting, or using any instance other than the official (healthchecks.io), you will need to specify the host address. E.g. `https://healthchecks.example.com` or `http://cron-monitoing.local`

#### Example

```yaml
- type: health-checks
  options:
    apiKey: XXXXXXXXX
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟠 Free plan (up to 20 services, or self-host for unlimited)
- **Host**: Managed Instance or Self-Hosted (see [GitHub - HealthChecks](https://github.com/healthchecks/healthchecks))
- **Privacy**: _See [Health-Checks Privacy Policy](https://healthchecks.io/privacy/)_

---

### CPU History (NetData)

Pull recent CPU usage history from NetData.

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/cpu-history" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Required | The URL to your NetData instance
**`chartHeight`** | `number` | _Optional_ | The height of rendered chart in px. Defaults to `300`
**`chartColor`** / **`chartColors`** | `string` / `array`| _Optional_ | Color of the chart value(s) as hex codes. `chartColor` is a single value (defaults to `--widget-text-color`), whereas `chartColors` is an array of colors

#### Example

```yaml
- type: nd-cpu-history
  options:
  host: http://192.168.1.1:19999
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - NetData](https://github.com/netdata/netdata))
- **Privacy**: _See [NetData Privacy Policy](https://www.netdata.cloud/data-privacy/)_

---

### Memory History (NetData)

Pull recent system RAM usage from NetData, and show as a breakdown of different categories.

<p align="center"><img width="600" src="https://i.ibb.co/2dsSWnk/nd-memory-history.png" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Required | The URL to your NetData instance
**`chartHeight`** | `number` | _Optional_ | The height of rendered chart in px. Defaults to `300`
**`chartColor`** / **`chartColors`** | `string` / `array`| _Optional_ | Color of the chart value(s) as hex codes. `chartColor` is a single value (defaults to `--widget-text-color`), whereas `chartColors` is an array of colors

#### Example

```yaml
- type: nd-ram-history
  options:
    host: http://192.168.1.1:19999
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - NetData](https://github.com/netdata/netdata))
- **Privacy**: _See [NetData Privacy Policy](https://www.netdata.cloud/data-privacy/)_

---

### Load History (NetData)

Pull recent load usage in 1, 5 and 15 minute intervals, from NetData.

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/load-history" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Required | The URL to your NetData instance
**`chartHeight`** | `number` | _Optional_ | The height of rendered chart in px. Defaults to `300`
**`chartColor`** / **`chartColors`** | `string` / `array`| _Optional_ | Color of the chart value(s) as hex codes. `chartColor` is a single value (defaults to `--widget-text-color`), whereas `chartColors` is an array of colors

#### Example

```yaml
- type: nd-load-history
  options:
  host: http://192.168.1.1:19999
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - NetData](https://github.com/netdata/netdata))
- **Privacy**: _See [NetData Privacy Policy](https://www.netdata.cloud/data-privacy/)_

---

### Pi-Hole Stats

Displays the number of queries blocked by [Pi-Hole](https://pi-hole.net/).

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/pi-hole" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`hideStatus`** / **`hideChart`** / **`hideInfo`** | `boolean` |  _Optional_ | Optionally hide any of the three parts of the widget
**`apiKey`** | `string` |  Required | Your Pi-Hole web password. It is **NOT** your pi-hole admin interface or server password. It can be found in `/etc/pihole/setupVars.conf`, and is a 64-character located on the line that starts with `WEBPASSWORD`

#### Example

```yaml
- type: pi-hole-stats
  options:
    hostname: http://192.168.130.1
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

> [!TIP]
> To avoid storing secrets in plaintext, both `hostname` and `apiKey` can be supplied via environment variables. See [Handling Secrets](#handling-secrets).

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-Hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Pi-Hole Stats v6

Displays the number of queries blocked by [Pi-Hole](https://pi-hole.net/). Use this version of the widget if you have a v6+ Pi-Hole instance.

<p align="center"><img width="400" src="https://i.ibb.co/zftCLJN/pi-hole-stats.png" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`hideStatus`** / **`hideChart`** / **`hideInfo`** | `boolean` |  _Optional_ | Optionally hide any of the three parts of the widget
**`apiKey`** | `string` |  Required | Your Pi-Hole web password or application password. It **IS** your Pi-Hole admin interface password **UNLESS** you have 2FA turned on (in contrast to the old widget). If you have 2FA turned on you will need to create an application password. Refer to Pi-Hole documentation for how to create an application password.

#### Example

```yaml
- type: pi-hole-stats-v6
  options:
    hostname: http://192.168.130.1
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

> [!TIP]
> To avoid storing secrets in plaintext, both `hostname` and `apiKey` can be supplied via environment variables. See [Handling Secrets](#handling-secrets).

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-Hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Pi-Hole Queries

Shows top queries that were blocked and allowed by [Pi-Hole](https://pi-hole.net/).

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/pi-hole-queries" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`apiKey`** | `string` |  Required | Your Pi-Hole web password. It is **NOT** your pi-hole admin interface or server password. It can be found in `/etc/pihole/setupVars.conf`, and is a 64-character located on the line that starts with `WEBPASSWORD`
**`count`** | `number` |  _Optional_ | The number of queries to display. Defaults to `10`

#### Example

```yaml
- type: pi-hole-top-queries
  options:
    hostname: https://pi-hole.local
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Pi-Hole Queries v6

Shows top queries that were blocked and allowed by [Pi-Hole](https://pi-hole.net/). Use this version of the widget if you have a v6+ Pi-Hole instance.

<p align="center"><img width="400" src="https://i.ibb.co/pXR0bdQ/pi-hole-queries.png" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`apiKey`** | `string` |  Required | Your Pi-Hole web password or application password. It **IS** your Pi-Hole admin interface password **UNLESS** you have 2FA turned on (in contrast to the old widget). If you have 2FA turned on you will need to create an application password. Refer to Pi-Hole documentation for how to create an application password.
**`count`** | `number` |  _Optional_ | The number of queries to display. Defaults to `10`

#### Example

```yaml
- type: pi-hole-top-queries-v6
  options:
    hostname: https://pi-hole.local
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Pi-Hole Recent Traffic

Shows number of recent traffic, using allowed and blocked queries from [Pi-Hole](https://pi-hole.net/)

<p align="center"><img width="500" src="https://pixelflare.cc/alicia/dashy/pi-hole-trafic" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`apiKey`** | `string` |  Required | Your Pi-Hole web password. It is **NOT** your pi-hole admin interface or server password. It can be found in `/etc/pihole/setupVars.conf`, and is a 64-character located on the line that starts with `WEBPASSWORD`

#### Example

```yaml
- type: pi-hole-traffic
  options:
    hostname: https://pi-hole.local
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Pi-Hole Recent Traffic v6

Shows number of recent traffic, using allowed and blocked queries from [Pi-Hole](https://pi-hole.net/). Use this version of the widget if you have a v6+ Pi-Hole instance.

<p align="center"><img width="500" src="https://i.ibb.co/7kdxxwx/pi-hole-recent-queries.png" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Pi-Hole instance
**`apiKey`** | `string` |  Required | Your Pi-Hole web password or application password. It **IS** your Pi-Hole admin interface password **UNLESS** you have 2FA turned on (in contrast to the old widget). If you have 2FA turned on you will need to create an application password. Refer to Pi-Hole documentation for how to create an application password.

#### Example

```yaml
- type: pi-hole-traffic-v6
  options:
    hostname: https://pi-hole.local
    apiKey: xxxxxxxxxxxxxxxxxxxxxxx
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🔴 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Pi-hole](https://github.com/pi-hole/pi-hole))
- **Privacy**: _See [Pi-Hole Privacy Guide](https://pi-hole.net/privacy/)_

---

### Stat Ping Statuses

Displays the current and recent uptime of your running services, via a self-hosted instance of [StatPing](https://github.com/statping/statping)

<p align="center"><img width="300" src="https://pixelflare.cc/alicia/dashy/statping" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your StatPing instance, without a trailing slash
**`groupId`** | `number` | Optional | If provided, only Services in the given group are displayed. Defaults to `0` in which case all services are displayed.
**`showChart`** | `boolean`| Optional | If provided and `false` then charts are not displayed. Defaults to `true`.
**`showInfo`** | `boolean`| Optional | If provided and `false` then information summaries are not displayed. Defaults to `true`.

#### Example

```yaml
- type: stat-ping
  options:
    hostname: http://192.168.130.1:8080
```

or

```yaml
- type: stat-ping
  options:
    hostname: http://192.168.130.1:8080
    groupId: 3
    showChart: false
    showInfo: false
```

You can use multiple StatPing widgets with different `groupId`s.

Note, the Group Id is not directly visible in StatPing UI, you can inspect the group select HTML element or the API response to find out.

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Not Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - StatPing](https://github.com/statping/statping))
- **Privacy**: _See [StatPing Docs](https://docs.statping.com/)_

---

### Synology Download Station

Displays the current downloads/torrents tasks of your Synology NAS

<p align="center"><img width="500" src="https://pixelflare.cc/alicia/dashy/synology-downloads" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your Synology NAS, without a trailing slash
**`username`** | `string` |  Required | The username of a user on your synology NAS. You will see only this user download station tasks if he is not part of the administrator group. Currently don't support OTP protected accounts.
**`password`** | `string` |  Required | The password of the account specified above.

#### Example

```yaml
- type: synology-download
  options:
    hostname: http://192.168.1.1:8080
    username: dashy
    password: totally-secure-password


```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Synology](https://www.synology.com/en-us))
- **Privacy**: _See [Synology Privacy Statement](https://www.synology.com/en-us/company/legal/privacy)_

---

### AdGuard Home Block Stats

Fetches data from your [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) instance, and
displays total number of allowed and blocked queries, plus a pie chart showing breakdown by block type.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/adguard-stats" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your AdGuard Home instance
**`username`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your username here
**`password`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your password here

#### Example

```yaml
- type: adguard-stats
  useProxy: true
  options:
    hostname: http://127.0.0.1
    username: admin
    password: test
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟠 Optional
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [AdGuard Home](https://adguard.com/en/adguard-home/overview.html))
- **Privacy**: _See [AdGuard Privacy Policy](https://adguard.com/en/privacy.html)_

---

### AdGuard Home Filters

Fetches data from your [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) instance, to display the current status of each of your filter lists. Includes filter name, last updated, number of items, and a link to the list.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/adguard-filters" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your AdGuard Home instance
**`username`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your username here
**`password`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your password here
**`showOnOffStatusOnly`** | `boolean` |  _Optional_ | If set to `true`, will only show aggregated AdGuard filter status (on/off), instead of a list of filters

#### Example

```yaml
- type: adguard-filter-status
  useProxy: true
  options:
    hostname: http://127.0.0.1
    username: admin
    password: test
    showOnOffStatusOnly: false
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟠 Optional
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [AdGuard Home](https://adguard.com/en/adguard-home/overview.html))
- **Privacy**: _See [AdGuard Privacy Policy](https://adguard.com/en/privacy.html)_

---

### AdGuard Home DNS Info

Fetches data from your [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) instance, and displays the current status (Enabled / Disabled) of AdGuard DNS. Click show more to view detailed info, including upstream DNS provider, active ports, and the status of DNSSEC, EDNS CS, PTR and IPv6.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/adguard-dns" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your AdGuard Home instance
**`username`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your username here
**`password`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your password here
**`showFullInfo`** | `boolean` |  _Optional_ | If set to `true`, the full DNS info will be shown by default, without having to click "Show Info"

#### Example

```yaml
- type: adguard-dns-info
  useProxy: true
  options:
    hostname: http://127.0.0.1
    username: admin
    password: test
    showFullInfo: false
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟠 Optional
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [AdGuard Home](https://adguard.com/en/adguard-home/overview.html))
- **Privacy**: _See [AdGuard Privacy Policy](https://adguard.com/en/privacy.html)_

---

### AdGuard Home Top Domains

Fetches data from your [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) instance, and displays a list of the most queried, and most blocked domains.

<p align="center"><img width="600" src="https://pixelflare.cc/alicia/dashy/adguard-domains" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL to your AdGuard Home instance
**`username`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your username here
**`password`** | `string` |  _Optional_ | If you've got auth enabled on AdGuard, provide your password here
**`limit`** | `number` |  _Optional_ | Specify the number of results to show, between `1` and `100`, defaults to `10`
**`hideBlockedDomains`** | `boolean` |  _Optional_ | Don't show the blocked domains list (queried domains only)
**`hideQueriedDomains`** | `boolean` |  _Optional_ | Don't show the queried domains list (blocked domains only)

#### Example

```yaml
- type: adguard-top-domains
  useProxy: true
  options:
    hostname: http://127.0.0.1
    username: admin
    password: test
    limit: 10
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟠 Optional
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [AdGuard Home](https://adguard.com/en/adguard-home/overview.html))
- **Privacy**: _See [AdGuard Privacy Policy](https://adguard.com/en/privacy.html)_

---

### Nextcloud User

Nextcloud is a [self hosted](https://nextcloud.com/install/#instructions-server) productivity platform, it can also be used free of charge with [hundreds of existing hosting providers](https://nextcloud.com/sign-up/) that offer a free Nextcloud account.

Displays branding information of a Nextcloud server (logo, url, slogan) and some user details (name, login name, last login, disk space or quota). Use with regular or admin user.

Shows quota usage when quota is enabled for the user or disk usage when not enabled.

Known issues: the User API incorrectly reports available disk space as total for admin users when quota is not enabled (which usually is the case for admins).

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/nextcloud-user" alt="nextcloud-user" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Nextcloud username
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)

#### Example

```yaml
- type: nextcloud-user
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_

---

### Nextcloud User Statuses

Show user statuses for selected users.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/nextcloud-user-status" alt="nextcloud-userstatus" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Nextcloud username
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)
**`users`** | `array` |  Required | Nextcloud User IDs to show statuses for, list size between `1` and `100`
**`showEmpty`** | `boolean` |  _Optional_ | Show statuses without a message, defaults to `true`

#### Example

```yaml
- type: nextcloud-userstatus
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
    users: ['bob', 'alice']
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_

---

### Nextcloud Notifications

Displays your notifications and allows deleting them.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/next-cloud-notifications" alt="nextcloud-notifications" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Nextcloud username
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)
**`limit`** | `number\|string` |  _Optional_ | Limit displayed notifications either by count, e.g. `5` to show the 5 most recent, or by age, e.g. `1d` to only show notifications not older than a day. Accepted suffixes for age limit are `m`, `h` and `d`.

#### Example

```yaml
- type: nextcloud-notifications
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
    limit: 6h
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_

---

### Nextcloud System

Visualises overall memory utilisation and CPU load averages, shows server versions.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/next-cloud-sysyem" alt="nextcloud-system" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Must be a Nextcloud admin user
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)

#### Example

```yaml
- type: nextcloud-system
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_

---

### Nextcloud Stats

Shows key usage statistics about your Nextcloud server.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/nextcloud-stats" alt="nextcloud-stats" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Must be a Nextcloud admin user
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)

#### Example

```yaml
- type: nextcloud-stats
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_

---

### Nextcloud PHP OPcache Stats

Shows statistics about PHP OPcache performance on your Nextcloud server.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/nextcloud-php" alt="nextcloud-phpopcache" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL of the Nextcloud server
**`username`** | `string` |  Required | Must be a Nextcloud admin user
**`password`** | `string` |  Required | Nextcloud app-password (create one in Settings -> Security)

#### Example

```yaml
- type: nextcloud-php-opcache
  useProxy: true
  options:
    hostname: https://nextcloud.example.com
    username: alice
    password: xxxxx-xxxxx-xxxxx-xxxxx
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Nextcloud](https://nextcloud.com))
- **Privacy**: _See [Nextcloud Privacy Policy](https://nextcloud.com/privacy)_


---

### Proxmox lists

Shows lists of nodes, containers, and VMs in a Proxmox virtual environment cluster, with a status indicator.

#### Options
**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`cluster_url`** | `string` |  Required | The URL of the proxmox cluster server. No trailing `/`. for example: `https://proxmox.lan:8006`
**`user_name`** | `string` |  Required | A Proxmox API Username, for example `root@pam` or `dashy@pve`.
**`token_name`** | `string` |  Required | A Proxmox API token name. You can get a token in the API section of the cluster management interface.
**`token_uuid`** | `string` |  Required | The value of the token entered above. This is normally a UUID. 
**`node`** | `string` |  optional | A Proxmox node name. If empty or not supplied, a list of nodes will be shown.
**`node_data`** | `string` |  optional | This is required if a node is selected, Currently this accepts two values, either `lxc` or `qemu` but the widget can be improved to get other types of data from the Proxmox API.
**`title`** | `string` |  optional | A widget title.
**`title_as_link`** | `boolean` |  optional | When this is set to anything other than 0 or false, the title will be linked to the value entered in the `cluster_url` option.
**`footer`** | `string` |  optional | A widget footer.
**`footer_as_link`** | `boolean` |  optional | When this is set to anything other than 0 or false, the title will be linked to the value entered in the `cluster_url` option.
**`hide_templates`** | `boolean` |  optional | When this is set to anything other than 0 or false, templates will be filtered out of the result list.

#### Example
This will show the list of nodes.
```yaml
  - type: proxmox-lists
    useProxy: true 
    options:
      cluster_url: https://proxmox.lan:8006
      user_name: root@pam
      token_name: dashy
      token_uuid: bfb152df-abcd-abcd-abcd-ccb95a472d01
```

This will show the list of VMs, with a title and a linked fotter, hiding VM templates.

```yaml
  - type: proxmox-lists
    useProxy: true 
    options:
      cluster_url: https://proxmox.lan:8006
      user_name: root@pam
      token_name: dashy
      token_uuid: bfb152df-abcd-abcd-abcd-ccb95a472d01
      node: proxmox
      node_data: qemu
      title: Proxmox VMs
      title_as_link: false
      footer: Proxmox
      footer_as_link: true
      hide_templates: 1
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Proxmox Virtual Environment](https://proxmox.com/en/proxmox-ve))
- **Privacy**: _See [Proxmox's Privacy Policy](https://proxmox.com/en/privacy-policy)_

#### Troubleshooting
- **404 Error in development mode**: The error might disappear in production mode `yarn start`
- **500 Error in production mode**: Try adding the certificate authority (CA) certificate of your Proxmox host to Node.js. 
  - Download the Proxmox CA certificate to your Dashy host.
  - Export environment variable `NODE_EXTRA_CA_CERTS` and set its value to the path of the downloaded CA certificate. Example:  `export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/devlab_ca.pem`

---

### Sabnzbd

Shows queue information regarding your self hosted Sabnzbd server.

<p align="center"><img width="450" src="https://pixelflare.cc/alicia/dashy/sabnzbd" alt="Sabnzbd" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`sabnzbdUrl`** | `string` |  Required | The URL of the Sabnzbd server. No trailing `/`.
**`apiKey`** | `string` |  Required | API key for Sabnzbd access. Located under `Config` -> `General` -> `Security` -> `API Key`.
**`hideDetails`** | `boolean` |  _Optional_ | Hides extra server queue details.
**`hideQueue`** | `boolean` |  _Optional_ | Hides the queue list in an expandable dropdown.

#### Example

```yaml
  - type: sabnzbd
    options:
      sabnzbdUrl: 'https://sabnzbd.example.com'
      apiKey: XXXXXXXXXXXXXXXXXX
      hideDetails: false
      hideQueue: false
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Sabnzbd](https://sabnzbd.org/))
- **Privacy**: _See [Sabnzbd Privacy Policy](https://forums.sabnzbd.org/ucp.php?mode=privacy)_

---

### Gluetun VPN Info

Display info from the Gluetun VPN container public IP API. This can show the IP and location data for the exit VPN node.

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/guletn-vpn" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`visibleFields`** | `string` |  Required | A comma separated list of the fields you want visible in the widget. You can have any number of the following : `public_ip`, `region`, `country`, `city`, `location`, `organisation`, `postal_code`, `timezone`. Defaults to just `public_ip`
**`host`** | `string` |  Required | The url to the gluetun HTTP control server. E.g. `http://gluetun:8000`

#### Example

```yaml
- type: gluetun-status
  useProxy: true
  options:
    hostname: http://server-or-conatiner-hostname:8000
    visibleFields: public_ip,region,country,city,location,organisation,postal_code,timezone
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Gluetun](https://github.com/qdm12/gluetun))
- **Privacy**: _See [Gluetun Wiki](https://github.com/qdm12/gluetun/wiki)_

---

### Drone CI Builds

Display the last builds from a [Drone CI](https://www.drone.ci) instance. A self-hosted CI system that uses docker.

<p align="center"><img width="380" src="https://pixelflare.cc/alicia/dashy/drone-ci" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Required | The hostname of the Drone CI instance.
**`apiKey`** | `string` |  Required | The API key (https://[your-drone-instance]/account).
**`limit`** | `integer` | _Optional_ | Limit the amounts of listed builds.
**`repo`** | `string` | _Optional_ | Show only builds of the specified repo

#### Example

```yaml
- type: drone-ci
  updateInterval: 30
  options:
    host: https://drone.somedomain.com
    apiKey: my-very-secret-api-key
    limit: 10
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Drone](https://www.drone.io))
- **Privacy**: _See [Drone](https://www.drone.io)_

---

### Filebrowser

Displays storage statistics and file listings from a [Filebrowser Quantum](https://github.com/gtsteffaniak/filebrowser) instance. Shows directory size, file/folder counts, favorite files, and recently modified files with quick-access links.

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` | Required | The URL of your Filebrowser instance
**`apiKey`** | `string` | Required | A long-lived API key (create in Settings → API Keys)
**`source`** | `string` | _Optional_ | The source/scope name to browse. Defaults to the first available source
**`path`** | `string` | _Optional_ | The directory path to display. Defaults to `/`
**`favorites`** | `array` | _Optional_ | List of filenames to show as quick-access favorites
**`showRecent`** | `number` | _Optional_ | Number of recently modified files to display. Defaults to `5`, set to `0` to disable
**`limit`** | `number` | _Optional_ | Maximum number of files to display per section. Defaults to `10`
**`hideStats`** | `boolean` | _Optional_ | If `true`, hides the storage statistics section
**`hideFavorites`** | `boolean` | _Optional_ | If `true`, hides the favorites section
**`hideRecent`** | `boolean` | _Optional_ | If `true`, hides the recent files section
**`showDetailedStats`** | `boolean` | _Optional_ | If `true`, shows additional statistics including last modified date, largest file, hidden file count, total items, and file type breakdown. Defaults to `false`

#### Example

**Basic usage:**

```yaml
- type: filebrowser
  useProxy: true
  options:
    hostname: http://filebrowser.local:8080
    apiKey: DASHY_FILEBROWSER_KEY
    source: Documents
    path: /
    showRecent: 5
    favorites:
      - important-notes.txt
      - config.yaml
```

**With detailed statistics:**

```yaml
- type: filebrowser
  useProxy: true
  options:
    hostname: http://filebrowser.local:8080
    apiKey: DASHY_FILEBROWSER_KEY
    source: Downloads
    showDetailedStats: true
    showRecent: 10
    limit: 15
```

#### Widget Sections

The widget displays up to four sections:

1. **Storage Stats** - Directory name, total size, file and folder counts
2. **Detailed Stats** (optional) - Last modified date, largest file, hidden file count, total items, and file type breakdown with badges
3. **Favorites** - Quick-access links to user-specified files
4. **Recent Files** - Most recently modified files sorted by date

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Filebrowser Quantum](https://github.com/gtsteffaniak/filebrowser))
- **Privacy**: _Self-Hosted_

---

### Linkding

Linkding is a self-hosted bookmarking service, which has a clean interface and is simple to set up. This lists the links, filterable by tags.

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`host`** | `string` |  Required | The hostname of the Drone CI instance.
**`apiKey`** | `string` |  Required | The API key (https://your-linkding-instance/settings/integrations).
**`tags`** | `list of string` | _Optional_ | Filter the links by tag.

#### Example

```yaml
- type: linkding
  updateInterval: 30
  options:
    host: https://lingding.somedomain.com
    apiKey: my-very-secret-api-key
    tags: 
      - rpg
      - markdown
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Linkding](https://github.com/sissbruecker/linkding))
- **Privacy**: _See [Linkding](https://github.com/sissbruecker/linkding)_

---

### Uptime Kuma

[Uptime Kuma](https://github.com/louislam/uptime-kuma) is an easy-to-use self-hosted monitoring tool.

#### Options

| **Field**    | **Type** | **Required** | **Description**                                                          |
| ------------ | -------- | ------------ | ------------------------------------------------------------------------ |
| **`url`**    | `string` | Required     | The URL of the Uptime Kuma instance                                      |
| **`apiKey`** | `string` | Required     | The API key (see https://github.com/louislam/uptime-kuma/wiki/API-Keys). |

#### Example

```yaml
- type: uptime-kuma
  useProxy: true
  options:
    apiKey: uk2_99H0Yd3I2pPNIRfn0TqBFu4g5q85R1Mh75yZzw6H
    url: http://192.168.1.106:3691/metrics
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Uptime Kuma](https://github.com/louislam/uptime-kuma) )
- **Privacy**: _See [Uptime Kuma](https://github.com/louislam/uptime-kuma)_

---

### Uptime Kuma Status Page

[Uptime Kuma](https://github.com/louislam/uptime-kuma) is an easy-to-use self-hosted monitoring tool.

#### Options

| **Field**          | **Type** | **Required** | **Description**                                                                   |
| ------------------ | -------- | ------------ | --------------------------------------------------------------------------------- |
| **`host`**         | `string` | Required     | The URL of the Uptime Kuma instance                                               |
| **`slug`**         | `string` | Required     | The slug of the status page                                                       |
| **`monitorNames`** | `strins` | _Optional_   | Names of monitored services (in the same order as on the kuma uptime status page) |

#### Example

```yaml
- type: uptime-kuma-status-page
  options:
    host: http://localhost:3001
    slug: another-beautiful-status-page
    monitorNames:
      - "Name1"
      - "Name2"
```

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟢 Not Needed
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Uptime Kuma](https://github.com/louislam/uptime-kuma) )
- **Privacy**: _See [Uptime Kuma](https://github.com/louislam/uptime-kuma)_

---

### Tactical RMM

[Tactical RMM](https://github.com/amidaware/tacticalrmm) is a self-hosted remote monitoring & management tool.

<p align="center"><a href="https://github.com/user-attachments/assets/152a7205-e5de-401f-bad8-19063ddfaf3c">
    <img src="https://github.com/user-attachments/assets/5921d46f-d84c-494d-8aaf-6b20cc592640" alt="Capture" border="0"></a></p>


#### Options

| **Field**    | **Type** | **Required** | **Description**                                                          |
| ------------ | -------- | ------------ | ------------------------------------------------------------------------ |
| **`url`**    | `string` | Required     | The status endpoint URL (https://api.example.com/core/v2/status/)           |
| **`token`**  | `string` | Required     | The MON_TOKEN (see https://docs.tacticalrmm.com/tipsntricks/#monitor-your-trmm-instance-via-the-built-in-monitoring-endpoint). |

#### Example

```yaml
- type: trmm
  useProxy: true
  options:
    token: PkPVKMzbmXgeQDlJWb0WXYvsIk3JvZyadURud2cSTdMia6hUbQ
    url: https://api.example.com/core/v2/status/
```

#### Info

- **CORS**: 🟠 Proxied
- **Auth**: 🟢 Required
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [Tactical RMM](https://github.com/amidaware/tacticalrmm) )
- **Privacy**: _See [Tactical RMM](https://github.com/amidaware/tacticalrmm)_


---

## System Resource Monitoring

### Glances
The easiest method for displaying system info and resource usage in Dashy is with [Glances](https://nicolargo.github.io/glances/).

Glances is a cross-platform monitoring tool developed by [@nicolargo](https://github.com/nicolargo). It's similar to top/htop but with a [Rest API](https://glances.readthedocs.io/en/latest/api.html) and many [data exporters](https://glances.readthedocs.io/en/latest/gw/index.html) available. Under the hood, it uses [psutil](https://github.com/giampaolo/psutil) for retrieving system info.

If you don't already have it installed, either follow the [Installation Guide](https://github.com/nicolargo/glances/blob/master/README.rst) for your system, or setup [with Docker](https://glances.readthedocs.io/en/latest/docker.html), or use the one-line install script: `curl -L https://bit.ly/glances | /bin/bash`.

If you are using Docker to run glances make sure to add the enviroment variable `-e TZ = {YourTimeZone}`. You can get a list of valid timezones by running `timedatectl list-timezones` on any linux system. This is needed so the graphs show the currect time.

Here an example for Docker
```
 docker run -d \
    --name glances \
    --restart unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -p 61208:61208 \
    --pid host \
    --privileged \
    -e GLANCES_OPT=-w \
    -e PUID=1000 \
    -e PGID=1000 \
    -e TZ=Europe/Zurich \
    nicolargo/glances:latest
```

Glances can be launched with the `glances` command. You'll need to run it in web server mode, using the `-w` option for the API to be reachable. If you don't plan on using the Web UI, then you can disable it using `--disable-webui`. See the [command reference docs](https://glances.readthedocs.io/en/latest/cmds.html) for more info.

If Glances is running on a Windows system it is recommended to add the following arguments ```--disable-plugin all --enable-plugin cpu,mem,diskio,ip,network,containers,quicklook,load,fs,alert -w``` This is due to Glances not being that stable on windows, so disabling all plugins that aren't used by Dashy widgets can save on ressources.

#### Options

All Glance's based widgets require a `hostname`. All other parameters are optional.

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`hostname`** | `string` |  Required | The URL or IP + port to your Glances instance (without a trailing slash)
**`username`** | `string` |  _Optional_ | If you have setup basic auth on Glances, specify username here (defaults to `glances`)
**`password`** | `string` |  _Optional_ | If you have setup basic auth on Glances, specify password here. **Note**: since this password is in plaintext, it is important not to reuse it anywhere else
**`apiVersion`** | `string` |  _Optional_ | Specify an API version, defaults to V `3`. Note that support for older versions is limited
**`limit`** | `number` |  _Optional_ | For widgets that show a time-series chart, optionally limit the number of data points returned. A higher number will show more historical results, but will take longer to load. A value between 300 - 800 is usually optimal

Note that if auth is configured, requests must be proxied with `useProxy: true`

#### Info

- **CORS**: 🟢 Enabled
- **Auth**: 🟠 Optional
- **Price**: 🟢 Free
- **Host**: Self-Hosted (see [GitHub - Nicolargo/Glances](https://github.com/nicolargo/glances))
- **Privacy**: ⚫ No Policy Available

#### Screenshot

[![example-screenshot](https://pixelflare.cc/alicia/dashy/monitor-board)](https://ibb.co/pR6dMZT)

---

### Current CPU Usage

Live-updating current CPU usage, as a combined average across all cores

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/current-cpu" /></p>

#### Example

```yaml
- type: gl-current-cpu
  options:
    hostname: http://192.168.130.2:61208
```

---

### Current CPU Usage Speedometer

Speedometer styled version of the Current CPU Usage widget

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/current-cpu-speedometer" /></p>

#### Example

```yaml
- type: gl-cpu-speedometer
  options:
    hostname: http://192.168.130.2:61208
```

---

### CPU Usage Per Core

Live-updating CPU usage breakdown per core

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/cpu-per-core" /></p>

#### Example

```yaml
- type: gl-current-cores
  options:
    hostname: http://192.168.130.2:61208
```

---

### CPU Usage History

Recent CPU usage history, across all cores, and displayed by user and system

<p align="center"><img width="500" src="https://pixelflare.cc/alicia/dashy/cpu-history-chart" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`limit`** | `number` |  _Optional_ | Limit the number of results returned, rendering more data points will take longer to load. Defaults to `100`

#### Example

```yaml
- type: gl-cpu-history
  options:
    hostname: http://192.168.130.2:61208
    limit: 60
```

---

### Current Memory Usage

Real-time memory usage gauge, with more info visible on click

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/current-mem" /></p>

#### Example

```yaml
- type: gl-current-mem
  options:
    hostname: http://192.168.130.2:61208
```

---

### Current Memory Usage Speedometer

Speedometer styled version of the Current Memory Usage widget

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/current-mem-speedometer" /></p>

#### Example

```yaml
- type: gl-mem-speedometer
  options:
    hostname: http://192.168.130.2:61208
```

---

### Memory Usage History

Recent memory usage chart

<p align="center"><img width="500" src="https://pixelflare.cc/alicia/dashy/mem-history-glances" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`limit`** | `number` |  _Optional_ | Limit the number of results returned, rendering more data points will take longer to load. Defaults to `100`

#### Example

```yaml
- type: gl-mem-history
  options:
    hostname: http://localhost:61208
    limit: 80
```

---

### Disk Space

List connected disks, showing free / used space and other info (file system, mount point and space available)

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/diskspace-glances" /></p>

#### Example

```yaml
- type: gl-disk-space
  options:
    hostname: http://192.168.130.2:61208
```

---

### Disk IO

Shows real-time read and write speeds and operations per sec for each disk

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/disk-io-glances" /></p>

#### Example

```yaml
- type: gl-disk-io
  options:
    hostname: http://192.168.130.2:61208
```

---

### System Load

Shows the number of processes waiting in the run-queue, averaged across all cores. Displays for past 5, 10 and 15 minutes

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/system-load-glances" /></p>

#### Example

```yaml
- type: gl-system-load
  options:
    hostname: http://192.168.130.2:61208
```

---

### Uptime

Displays the system uptime fetched from Glances.

#### Example

```yaml
- type: gl-uptime
  options:
    hostname: http://192.168.130.2:61208
```

---

### System Load History

Shows recent historical system load, calculated from the number of processes waiting in the run-queue, in 1, 5 and 15 minute intervals, and averaged across all cores. Optionally specify `limit` to set number of results returned, defaults to `500`, max `100000`, but the higher the number the longer the load and render times will be.

<p align="center"><img width="500" src="https://pixelflare.cc/alicia/dashy/system-load-history-glances" /></p>

#### Example

```yaml
- type: gl-load-history
  options:
    hostname: http://192.168.130.2:61208
```

---

### Network Interfaces

Lists visible network interfaces, including real-time upload/ download stats

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/network-interfaces-glances" /></p>

#### Example

```yaml
- type: gl-network-interfaces
  options:
    hostname: http://192.168.130.2:61208
```

---

### Network Traffic

Shows amount of data recently uploaded/ downloaded across all network interfaces. Optionally set the `limit` option to specify number historical of data points to return

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/network-traffic-glances" /></p>

#### Example

```yaml
- type: gl-network-traffic
  options:
    hostname: http://192.168.130.2:61208
    limit: 500
```

---

### Resource Usage Alerts

Lists recent high resource usage alerts (e.g. CPU, mem, IO, load, temp)

<p align="center"><img width="400" src="https://i.ibb.co/w01NX5R/gl-alerts.png" /></p>

#### Example

```yaml
- type: gl-alerts
  options:
    hostname: http://192.168.130.2:61208
```

---

### IP Address

Shows public and private IP address. Note that the ip plugin is not available on all instances of Glances.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/ip-addresses-glances" /></p>

#### Example

```yaml
- type: gl-ip-address
  options:
    hostname: http://192.168.130.2:61208
```

---

### CPU Temp

Displays temperature data from system CPUs.

Note: This widget uses the [`sensors`](https://github.com/nicolargo/glances/blob/develop/glances/plugins/glances_sensors.py) plugin, which is disabled by default, and may cause [performance issues](https://github.com/nicolargo/glances/issues/1664#issuecomment-632063558).
You'll need to enable the sensors plugin to use this widget, using: `--enable-plugin sensors` when you start Glances.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/cpu-temp-glances" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`units`** | `string` |  _Optional_ | Use `C` to display temperatures in Celsius or `F` to use Fahrenheit. Defaults to `C`.

#### Example

```yaml
- type: gl-cpu-temp
  options:
    hostname: http://192.168.130.2:61208
    units: C
```

---

### Compact Metrics

A multi-system overview widget that displays CPU, memory and disk usage for multiple Glances instances in a compact table. Click on a row to see detailed metrics for that system.

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`systems`** | `array` | Required | An array of systems to monitor, each with `header` (display name) and `url` (Glances base URL)
**`apiVersion`** | `number` | _Optional_ | Glances API version. Defaults to `4`
**`username`** | `string` | _Optional_ | If Glances is password-protected, specify the username
**`password`** | `string` | _Optional_ | If Glances is password-protected, specify the password

#### Example

```yaml
- type: gl-compact-metrics
  options:
    systems:
      - header: Server 1
        url: http://192.168.1.10:61208
      - header: Server 2
        url: http://192.168.1.11:61208
      - header: NAS
        url: http://192.168.1.20:61208
```

---

## Dynamic Widgets

### Iframe Widget

Embed any webpage into your dashboard as a widget.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/iframe" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`url`** | `string` |  Required | The URL to the webpage to embed
**`frameHeight`** | `number` | _Optional_ | If needed, specify height of iframe in `px`. E.g. `400`, defaults to auto

#### Example

```yaml
- type: iframe
  options:
    url: https://fiatleak.com/
```

---

### HTML Embedded Widget

Many websites and apps provide their own embeddable widgets. These can be used with Dashy using the Embed widget, which lets you dynamically embed and HTML, CSS or JavaScript contents.

⚠️ **NOTE:** Use with extreme caution. Embedding a script from an untrustworthy source may have serious unintended consequences.

<p align="center"><img width="400" src="https://pixelflare.cc/alicia/dashy/html-embed" /></p>

#### Options

**Field** | **Type** | **Required** | **Description**
--- | --- | --- | ---
**`html`** | `string` |  _Optional_ | HTML contents to render in the widget
**`script`** | `string` |  _Optional_ | Raw JavaScript code to execute (caution)
**`scriptSrc`** | `string` |  _Optional_ | A URL to JavaScript content (caution)
**`css`** | `string` |  _Optional_ | Any stylings for widget contents

#### Example

```yaml
- type: embed
  options:
    scriptSrc: https://cdn.speedcheck.org/basic/scbjs.min.js
    html: |
      <div id="sc-container">
      <div id="sc-branding" class="sc-bb">
      <a target="_blank" href="https://www.speedcheck.org/">
      <img src="https://cdn.speedcheck.org/branding/speedcheck-logo-18.png" alt="Speedcheck"/>
      </a>
      </div>
      </div>
```

Or

```yaml
- type: embed
    options:
      css: '.coinmarketcap-currency-widget { color: var(--widget-text-color); }'
      html: '<div class="coinmarketcap-currency-widget" data-currencyid="1" data-base="USD" data-secondary="" data-ticker="true" data-rank="true" data-marketcap="true" data-volume="true" data-statsticker="true" data-stats="USD"></div>'
      scriptSrc: 'https://files.coinmarketcap.com/static/widget/currency.js'
```

You can also use this widget to display an image, wither locally or from a remote origin.

```yaml
- type: embed
  options:
    html: '<img src="https://dashy.lan/item-icons/my-image.png" />'
```

---

### API Response

Directly output plain-text response from any API-enabled service.

// Coming soon...

---

### Prometheus Data

Display data from any service with a Prometheus exporter.

// Coming soon...

---

### Data Feed

Show live data from an RSS-enabled service. The only required parameter is `rssUrl`, which is the URL to the ATOM feed. See [RSS Widget](#rss-feed) for full list of available options.

<p align="center"><img width="700" src="https://pixelflare.cc/alicia/dashy/data-feed" /></p>

#### Example

```yaml
- type: rss-feed
  options:
    rssUrl: https://notes.aliciasykes.com/feed
```

---

## Usage & Customizations

### Widget Usage Guide

Like items, widgets are placed under sections. You may have one or more widgets per section.

In your YAML config file, this will look something like:

```yaml
sections:
- name: Today
  icon: far fa-calendar-day
  widgets:
  - type: clock
    options:
      format: en-GB
  - type: weather
    options:
      apiKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      city: London
      units: metric
```

> In this example, there is a single section, named "Today", using a Calendar icon from Font-Awesome. It has 2 widgets, a clock and the current weather.

---

### Continuous Updates

By default, a widget which displays dynamic data from an external source, will only fetch results on page load. If you would like to keep data updated at all times, you can enable **Continuous Updates**. This is done by setting a time value in the `updateInterval` field.

The value of `updateInterval` is optional, and is specified and seconds. It must be more than `10` and less than `7200`.

For example, the following widget displaying stats from Pi-Hole will update ever 20 seconds.

```yaml
widgets:
- type: pi-hole-stats
  updateInterval: 20
  options:
    hostname: http://192.168.130.2
```

Note that if you have many widgets, and set them to continuously update frequently, you will notice a hit to performance. A widget that relies on data from an external API, will also consume your usage quota faster, if set to keep updating.

---

### Proxying Requests

If a widget fails to make a data request, and the console shows a CORS error, this means the server is blocking client-side requests.

Dashy has a built-in CORS proxy ([`services/cors-proxy.js`](https://github.com/Lissy93/dashy/blob/master/services/cors-proxy.js)), which will be used automatically by some widgets, or can be forced to use by other by setting the `useProxy` option.

For example:

```yaml
widgets:
- type: pi-hole-stats
  useProxy: true
  options:
    hostname: http://pi-hole.local
```

Alternatively, and more securely, you can set the auth headers on your service to accept requests from Dashy. For example:

```text
Access-Control-Allow-Origin: https://location-of-dashy/
Vary: Origin
```

---

### Handling Secrets

Some widgets require you to pass potentially sensitive info such as API keys. The `conf.yml` is not ideal for this, as it's stored in plaintext. Instead, for secrets you should use environment variables.

In your widget options, set the value to the name of an environment variable starting with `DASHY_` (or `VITE_APP_` / `VUE_APP_` for backwards compatibility). The Dashy server will substitute it with the matching `process.env` value when proxying the request.

The widget must be set to route through the Dashy server with `useProxy: true`. Without this, the placeholder is sent directly to the upstream API and will fail. Substitution covers the request URL, headers and body, so any auth pattern (Bearer, Basic, query param, POST body) works.

For more information about setting and managing your environment variables, see [Management Docs --> Environmental Variables](/docs/management.md#passing-in-environmental-variables).

For example:

```yaml
- type: weather
  useProxy: true
  options:
    apiKey: DASHY_WEATHER_TOKEN
    city: London
    units: metric
    hideDetails: true
```

Then set `DASHY_WEATHER_TOKEN='xxx'` in your container or local environment, and restart Dashy. To rotate the value, just update the env var and restart. No rebuild required.

> [!NOTE]
> Only env vars starting with `DASHY_`, `VITE_APP_` or `VUE_APP_` are eligible for substitution. Other server-side env vars are never exposed.
>
> If you build Dashy from source yourself, `VITE_APP_*` and `DASHY_*` vars set at build time are also baked into the bundle by Vite, which works without `useProxy: true`.

---

### Setting Timeout

If the endpoint you are requesting data from is slow to respond, you may see a timeout error in the console. This can easily be fixed by specifying the `timeout` property on the offending widget. This should be an integer value, in milliseconds. By default timeout is `2500` ms (2½ seconds).

For example:

```yaml
- type: gl-current-cpu
  timeout: 8000
  options:
    hostname: https://glances.dns-device.local
```

---

### Adding Labels

If you have multiple widgets of the same type in a single section, it may not be clear what each one is. To overcome this, you can add a custom label to any given widget, using the `label` property.

For example:

```yaml
- name: CPU Usage
  icon: fas fa-tachometer
  widgets:
  - type: gl-current-cpu
    label: Meida Server
    options:
      hostname: http://media-server.lan:61208
  - type: gl-current-cpu
    label: Firewall
    options:
      hostname: http://firewall.lan:61208
  - type: gl-current-cpu
    label: File Sync Server
    options:
      hostname: http://file-sync.lan:61208
```

---

### Ignoring Errors

When there's an error fetching or displaying a widgets data, then it will be highlighted in yellow, and a message displayed on the UI.

In some instances, this is a false positive, and the widget is actually functioning correctly. If this is the case, you can disable the UI error message of a given widget by setting: `ignoreErrors: true`

```yaml
- type: gl-disk-io
  ignoreErrors: true
  options:
    hostname: https://glances.dns-device.local
```

---

### Widget Styling

Like elsewhere in Dashy, all colours can be easily modified with CSS variables.

Widgets use the following color variables, which can be overridden if desired:

- `--widget-text-color` - Text color, defaults to `--primary`
- `--widget-background-color` - Background color, defaults to `--background-darker`
- `--widget-accent-color` - Accent color, defaults to `--background`

For more info on how to apply custom variables, see the [Theming Docs](/docs/theming.md#setting-custom-css-in-the-ui)

---

### Customizing Charts

For widgets that contain charts, you can set an array of colors under `chartColors`.
To specify the chart height, set `chartHeight` to an integer (in `px`), defaults to `300`.
For example:

```yaml
- type: gl-load-history
  options:
    hostname: http://192.168.130.2:61208
    chartColors: ['#9b5de5', '#f15bb5', '#00bbf9', '#00f5d4']
    chartHeight: 450
```

---

### Language Translations

Since most of the content displayed within widgets is fetched from an external API, unless that API supports multiple languages, translating dynamic content is not possible.

However, any hard-coded content is translatable, and all dates and times will display in your local format.

For more info about multi-language support, see the [Internationalization Docs](/docs/multi-language-support.md).

---

### Widget UI Options

Widgets can be opened in full-page view, by clicking the Arrow icon (top-right). The URL in your address bar will also update, and visiting that web address directly will take you straight to that widget.

You can reload the data of any widget, by clicking the Refresh Data icon (also in top-right). This will only affect the widget where the action was triggered from.

All [config options](/docs/configuring.md#section) that can be applied to sections, can also be applied to widget sections. For example, to make a widget section double the width, set `displayData.cols: 2` within the parent section. You can collapse a widget (by clicking the section title), and collapse state will be saved locally.

Widgets cannot currently be edited through the UI. This feature is in development, and will be released soon.  In the meantime, you can either use the JSON config editor, or use [VS Code Server](https://github.com/coder/code-server), or just SSH into your box and edit the conf.yml file directly.

---

### Build your own Widget

Widgets are built in a modular fashion, making it easy for anyone to create their own custom components.

For a full tutorial on creating your own widget, you can follow [this guide](/docs/development-guides.md/#building-a-widget), or take a look at [here](https://github.com/Lissy93/dashy/commit/3da76ce2999f57f76a97454c0276301e39957b8e) for a code example.

Alternatively, for displaying simple data, you could also just use the either the [iframe](#iframe-widget), [embed](#html-embedded-widget), [data feed](#data-feed) or [API response](#api-response) widgets.

---

### Requesting a Widget

Suggestions for widget ideas are welcome. But there is no guarantee that I will build your widget idea.

Please only request widgets for services that:

- Have a publicly accessible API
- Are CORS and HTTPS enabled
- Are free to use, or have a free plan
- Allow for use in their Terms of Service
- Would be useful for other users

You can suggest a widget [here](https://git.io/Jygo3), please star the repo before submitting a ticket. If you are a monthly GitHub sponsor, I will happily build out a custom widget for any service that meets the above criteria, usually within 2 weeks of initial request.

For services that are not officially supported, it is likely still possible to display data using either the [iframe](#iframe-widget), [embed](#html-embedded-widget) or [API response](#api-response) widgets. For more advanced features, like charts and action buttons, you could also build your own widget, using [this tutorial](/docs/development-guides.md/#building-a-widget), it's fairly straight forward, and you can use an [existing widget](https://github.com/Lissy93/dashy/tree/master/src/components/Widgets) (or [this example](https://git.io/JygKI)) as a template.

---

### Troubleshooting Widget Errors

If an error occurs when fetching or rendering results, you will see a short message in the UI. If that message doesn't adequately explain the problem, then you can [open the browser console](/docs/troubleshooting.md#how-to-open-browser-console) to see more details.

Before proceeding, ensure that if the widget requires auth your API is correct, and for custom widgets, double check that the URL and protocol is correct.

If you're able to, you can find more information about why the request may be failing in the Dev Tools under the Network tab, and you can ensure your endpoint is correct and working using a tool like Postman.

#### CORS Errors

The most common issue is a CORS error. This is a browser security mechanism which prevents the client-side app (Dashy) from from accessing resources on a remote origin, without that server's explicit permission (e.g. with headers like Access-Control-Allow-Origin). See the MDN Docs for more info: [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

There are several ways to fix a CORS error:

#### Option 1 - Ensure Correct Protocol

You will get a CORS error if you try and access a http service from a https source. So ensure that the URL you are requesting has the right protocol, and is correctly formatted.

#### Option 2 - Set Headers

If you have control over the destination (e.g. for a self-hosted service), then you can simply apply the correct headers.
Add the `Access-Control-Allow-Origin` header, with the value of either `*` to allow requests from anywhere, or more securely, the host of where Dashy is served from. For example:

```text
Access-Control-Allow-Origin: https://url-of-dashy.local
```

or

```text
Access-Control-Allow-Origin: *
```

#### Option 3 - Proxying Request

You can route requests through Dashy's built-in CORS proxy. Instructions and more details can be found [here](#proxying-requests). If you don't have control over the target origin, and you are running Dashy either through Docker, with the Node server or on Netlify, then this solution will work for you.

Just add the `useProxy: true` option to the failing widget.

#### Option 4 - Use a plugin

For testing purposes, you can use an addon, which will disable the CORS checks. You can get the Allow-CORS extension for [Chrome](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en-US) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin/), more details [here](https://mybrowseraddon.com/access-control-allow-origin.html)

---

### Raising an Issue

If you need to submit a bug report for a failing widget, then please include the full console output (see [how](/docs/troubleshooting.md#how-to-open-browser-console)) as well as the relevant parts of your config file. Before sending the request, ensure you've read the docs. If you're new to GitHub, an haven't previously contributed to the project, then please fist star the repo to avoid your ticket being closed by the anti-spam bot.
