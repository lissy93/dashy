# Privacy

Dashy was built with privacy in mind.
Self-hosting your own apps and services is a great way to protect yourself from the mass data collection employed by big tech companies, and Dashy was designed to make self-hosting easier.

Dashy operates on the premise, that:
- No external data requests should ever be made, unless explicitly enabled by the user
- All code is 100% open source, clearly documented and intended to be easily auditable
- Privacy-respecting by default. No premium features, analytics, tracking or ads

This document outlines all network requests, data storage requirements and data handling processes. See also the [security docs](/docs/security).

> [!TIP]
> Btw (shameless plug), if you care about your privacy, you might also like [awesome-privacy](https://github.com/Lissy93/awesome-privacy/)!<br />

## Contents

- [Browser Storage](#browser-storage)
- [Single Sign-On](#single-sign-on)
- [External Requests](#external-requests)
  - [Icons](#icons)
  - [Themes](#themes)
  - [Status Checking](#status-checking)
  - [Update Checks](#update-checks)
  - [Cloud Backup](#cloud-backup)
  - [Web Search](#web-search)
  - [Initialization Page](#initialization-page)
  - [Anonymous Error Reporting](#anonymous-error-reporting)
  - [Widgets](#widgets)
  - [Proxied Requests](#proxied-requests)
- [Server-Side Data](#server-side-data)

---

## Browser Storage

In order for user preferences to be persisted some data is stored locally in your browsers storage.
Aside from your username and login tokens (only when auth is enabled), no personal info is kept here. None of this data can be accessed by other domains, no data is ever sent to any server without your prior consent, and you can view or delete it at any time.

The following section outlines all data that is stored in the browsers, as cookies, session storage or local storage.

### Cookies

> [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) will expire after their pre-defined lifetime.
> Dashy uses cookies for authentication, when enabled.

- `dashyAuthToken` - A unique token, generated from a hash of users credentials, to verify they are authenticated. Only used when auth is enabled.

### Session Storage

> [Session storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is deleted when the current session ends (tab / window is closed).
> Dashy uses session storage for the error log, and a few short-lived flags that prevent redirect loops.

- `errorLog` - List of recent errors
- `dashy.oidc.signin-attempt` - Timestamp of the last SSO login attempt, prevents redirect loops
- `dashy.oidc.silent-attempt` - Timestamp of the last silent token renewal, prevents renewal loops
- `dashy.sub-config-reload-attempt` - Timestamp of the last config reload after re-authenticating
- `dashy-auth-proxy-reloaded` - Flag so service worker changes only trigger one page refresh

### Local Storage

> [Local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is persisted between sessions, and only deleted when manually removed.
> Dashy can use local storage to keep track of your preferences.

- `language` - The locale to show app text in
- `hideWelcomeHelpers` - Set to true once user dismissed welcome message, so that it's not shown again
- `layoutOrientation` - Preferred section layout, either auto, horizontal, vertical or masonry
- `collapseState` - Remembers which sections are collapsed
- `iconSize` - Size of items, either small, medium or large
- `theme` - Users applied theme
- `customColors` - Any color modifications made to a given theme
- `backupId` - If a backup has been made, the ID is stored here
- `backupHash` - A unique hash of the previous backups meta data
- `hideSettings` - Lets user hide or show the settings menu
- `username` - If user logged in, store username. Only used to show welcome message, not used for auth
- `confSections` - Array of sections, only used when user applies changes locally
- `confPages` - Array of additional pages, only used when user applies changes locally
- `pageInfo` - Config page info, only used when user applies changes locally
- `appConfig` - App config, only used when user applies changes locally
- `mostUsed` - If smart sort is used to order items by most used, store open count
- `lastUsed` - If smart sort is used to order items by last used, store timestamps
- `disableCriticalWarning` - Set once user dismisses the config error warning, so it's not shown again
- `isAdmin` - Whether the logged in user is an admin, used to show or hide config options in the UI
- `keycloakInfo` - Your groups and roles from your SSO provider, used to determine which sections you can see
- `idToken` - Your OIDC ID token, used to authenticate your requests to the server (see [Single Sign-On](#single-sign-on))
- `oidc.user:...` - Your OIDC session, including tokens and basic profile info (see [Single Sign-On](#single-sign-on))

### Service Worker Cache

If you've enabled the service worker (with `appConfig.enableServiceWorker`), the app's assets are cached in your browser's cache storage, so Dashy loads faster and can work offline. This is just a copy of the app itself, not your data. It's disabled by default, and you can clear the cache in the same place as your other site data (see below).

### Deleting Stored Data

You can manually view and delete session storage, local storage, cache storage and cookies at anytime. First [open](/docs/troubleshooting#how-to-open-browser-console) your browsers developer tools (usually <kbd>F12</kbd>), then under the Application tab select the storage category. Here you will see a list of stored data, and you can select any item and delete it.

---

## Single Sign-On

If you've configured Keycloak or another OIDC provider, the login flow happens directly between your browser and your identity provider. No third parties are involved, and Dashy never sees or stores your password.

After you log in, your tokens and some basic profile info (username, groups and roles) are kept in local storage, so you stay logged in between visits and the server can verify your requests. The exact keys are listed under [Local Storage](#local-storage) above. Logging out clears them all.

---

## External Requests

By default, Dashy will not make any external requests, unless you configure it to. Some features (which are off by default) do require internet access, and this section outlines those features, the services used, and (where applicable) links to their privacy policies.

### Icons

#### Font Awesome

If either any of your sections, items or themes are using icons from font-awesome, then it will be automatically enabled. But you can also manually enable or disable it by setting `appConfig.enableFontAwesome` to `true` / `false`. Requests are made directly to Font-Awesome CDN, for more info, see the [Font Awesome Privacy Policy](https://fontawesome.com/privacy).

#### Material Design Icons

If either any of your sections, items or themes are mdi icons, then it will be automatically enabled. But you can also manually enable or disable it by setting `appConfig.enableMaterialDesignIcons` to `true` / `false`. The icon font is loaded from the jsDelivr CDN, for more info, see the [jsDelivr Privacy Policy](https://www.jsdelivr.com/terms/privacy-policy).

#### Favicon Fetching

If an item's icon is set to `favicon`, then it will be auto-fetched from the corresponding URL. Since not all websites have their icon located at `/favicon.ico`, and if they do, it's often very low resolution (like `16 x 16 px`). Therefore, the default behavior is for Dashy to check if the URL is public, and if so will use an API to fetch the favicon. For self-hosted services, the favicon will be fetched from the default path, and no external requests will be made.

The default favicon API is [allesedv.com](https://favicon.allesedv.com/), but this can be changed by setting `appConfig.faviconApi` to an alternate source (`iconhorse`, `faviconkit`, `besticon`, `duckduckgo`, `yandex`, `google`, `webmasterapi`, `mcapi` and `allesedv` are supported). If you do not want to use any API, then you can set this property to `local`, and the favicon will be fetched from the default path. For hosted services, this will still incur an external request.

#### Generative Icons

If an item has the icon set to `generative`, then an external request is made to [DiceBear](https://dicebear.com/) to fetch the uniquely generated icon. The URL of a given service is used as the key for generating the icon, but it is first hashed and encoded for basic privacy. For more info, please reference the [DiceBear Privacy Policy](https://www.dicebear.com/legal/privacy-policy/)

As a fallback, if Dicebear fails, then [Evatar](https://evatar.io/) is used.

#### Self-Hosted Icons

If an item's icon uses the `sh-` prefix, icons are fetched from the [selfh.st icons](https://selfh.st/icons/) CDN at `https://cdn.jsdelivr.net/gh/selfhst/icons`. This only applies when you explicitly use the `sh-` prefix for an icon.

#### Simple Icons

If an item's icon uses the `si-` prefix, brand icons are fetched from [Simple Icons](https://simpleicons.org/), via the unpkg CDN at `https://unpkg.com/simple-icons`. This only applies when you explicitly use the `si-` prefix for an icon.

#### Dashboard Icons

If an item's icon uses the `hl-` prefix, icons are fetched from [homarr-labs/dashboard-icons](https://github.com/homarr-labs/dashboard-icons), via the jsDelivr CDN. This only applies when you explicitly use the `hl-` prefix for an icon.

#### Other Icons

Section icons, item icons and app icons are able to accept a URL to a raw image, if the image is hosted online then an external request will be made. To avoid the need to make external requests for icon assets, you can either use a self-hosted CDN, or store your images within `./public/item-icons` (which can be mounted as a volume if you're using Docker).

#### Web Assets

By default, all assets required by Dashy come bundled within the source, and so no external requests are made. If you add an additional font, which is imported from a CDN, then that will incur an external request. The same applies for other web assets, like external images, scripts or styles.

### Themes

Certain themes may use external assets (such as fonts or images). These are only loaded if you actively select the theme. Currently, this applies to: Adventure, Vaporwave, Glass, Glass-2 and Night Sky themes, which load background images from external sources.

### Status Checking

The status checking feature allows you to ping your apps/services and hosts to check if they are currently online and operational.

Dashy will ping your services directly, and does not rely on any third party. If you are checking the uptime status of a public/hosted application, then please refer to that services privacy policy. For all self-hosted services, requests happen locally within your network, and are not external.

### Update Checks

When the application loads, it checks for updates. The results of which are displayed in the config menu of the UI. This was implemented because using a very outdated version of Dashy may have unfixed issues. Your version is fetched from the source (local request), but the latest version is fetched from GitHub, which is an external request. This can be disabled by setting `appConfig.disableUpdateChecks: true`

### Cloud Backup

Dashy has an optional End-to-End encrypted [cloud backup feature](/docs/backup-restore). No data is ever transmitted unless you actively enable this feature through the UI.

All data is encrypted before being sent to the backend. This is done in [`CloudBackup.js`](https://github.com/Lissy93/dashy/blob/master/src/utils/CloudBackup.js), using [crypto.js](https://github.com/brix/crypto-js)'s AES method, using the users chosen password as the key. The data is then sent to a [Cloudflare worker](https://developers.cloudflare.com/workers/learning/how-workers-works) (a platform for running serverless functions), and stored in a [KV](https://developers.cloudflare.com/workers/learning/how-kv-works) data store.

Your selected password never leaves your device, and is hashed before being compared. It is only possible to restore a configuration if you have both the backup ID and decryption password. Because the data is encrypted on the client-side (before being sent to the cloud), it is not possible for a man-in-the-middle, government entity, website owner, or even Cloudflare to be able read any of your data.

### Web Search

Dashy has a primitive [web search feature](/docs/searching#web-search). No external requests are made, instead you are redirected to your chosen search engine (defaults to DuckDuckGo), using your chosen opening method.

This feature can be disabled under appConfig, with `webSearch: { disableWebSearch: true }`

### Initialization Page

When Dashy is first building (before the compiled app is ready), a static initialization page is displayed. This page loads a Google Font ([Fredoka One](https://fonts.google.com/specimen/Fredoka+One)) from `https://fonts.googleapis.com`. This only occurs during the build process, not during normal app usage. For more info, see [Google's Privacy Policy](https://policies.google.com/privacy).

### Anonymous Error Reporting

Error reporting is disabled by default, and no data will ever be sent without your explicit consent. In fact, the error tracking code isn't even imported unless you have actively enabled it. [Sentry](https://github.com/getsentry/sentry) is used for this, it's an open source error tracking and performance monitoring tool, used to identify any issues which occur in the production app (if you enable it).

The crash report includes the file or line of code that triggered the error, and a 2-layer deep stack trace. Reoccurring errors will also include the following user information: OS type (Mac, Windows, Linux, Android or iOS) and browser type (Firefox, Chrome, IE, Safari). Data scrubbing is enabled. IP address will not be stored. If any potentially identifiable data ever finds its way into a crash report, it will be automatically and permanently erased. All statistics collected are anonymized and stored securely, and are automatically deleted after 14 days. For more about privacy and security, see the [Sentry Docs](https://sentry.io/security/).

Enabling anonymous error reporting helps me to discover bugs I was unaware of, and then fix them, in order to make Dashy more reliable long term. Error reporting is activated by setting `appConfig.enableErrorReporting: true`.

If you need to monitor bugs yourself, then you can [self-host your own Sentry Server](https://develop.sentry.dev/self-hosted/), and use it by setting `appConfig.sentryDsn` to your Sentry instances [Data Source Name](https://docs.sentry.io/product/sentry-basics/dsn-explainer/), then just enable error reporting in Dashy.

### Widgets

Dashy supports [Widgets](/docs/widgets) for displaying dynamic content. Below is a list of all widgets that make external data requests, along with the endpoint they call and a link to the Privacy Policy of that service.

| Widget | Endpoint | Privacy Policy |
|---|---|---|
| [Weather](/docs/widgets#weather) / [Weather Forecast](/docs/widgets#weather-forecast) | `https://api.openweathermap.org` | [OWM Privacy Policy](https://openweather.co.uk/privacy-policy) |
| [RSS Feed](/docs/widgets#rss-feed) | `https://api.rss2json.com/v1/api.json` | [Rss2Json Privacy Policy](https://rss2json.com/privacy-policy) |
| [Calendar](/docs/widgets#calendar) | Your own ICS feed URL | _No third-party service; the feed you configure is fetched directly_ |
| [IP Address](/docs/widgets#public-ip) | `https://free.freeipapi.com/api/json` | [FreeIPAPI](https://freeipapi.com/) |
| | `https://ipinfo.io/json` | [IPInfo Privacy Policy](https://ipinfo.io/privacy-policy) |
| | `https://api.ipquery.io/` | [IPQuery](https://ipquery.io/) |
| | `http://ip-api.com/json` | [IP-API Privacy Policy](https://ip-api.com/docs/legal) |
| | `https://api.ipgeolocation.io/ipgeo` | [IPGeoLocation Privacy Policy](https://ipgeolocation.io/privacy.html) |
| [IP Blacklist](/docs/widgets#ip-blacklist) | `https://api.blacklistchecker.com` | [Blacklist Checker Privacy Policy](https://blacklistchecker.com/privacy) |
| | `https://api.ipify.org` | [ipify](https://www.ipify.org/) |
| [Domain Monitor](/docs/widgets#domain-monitor) | `https://api.whoapi.com` | [WhoAPI Privacy Policy](https://whoapi.com/privacy-policy/) |
| [Crypto Watch List](/docs/widgets#crypto-watch-list) / [Token Price History](/docs/widgets#crypto-token-price-history) | `https://api.coingecko.com` | [CoinGecko Privacy Policy](https://www.coingecko.com/en/privacy) |
| [Wallet Balance](/docs/widgets#wallet-balance) | `https://api.blockcypher.com/` | [BlockCypher Privacy Policy](https://www.blockcypher.com/privacy.html) |
| | `https://www.bitcoinqrcodemaker.com` | [Bitcoin QR Code Maker](https://www.bitcoinqrcodemaker.com/) |
| [Code::Stats](/docs/widgets#code-stats) | `https://codestats.net` | [Code::Stats Privacy Policy](https://codestats.net/tos#privacy) |
| [addy.io](/docs/widgets#addyio) | `https://app.addy.io` | [addy.io Privacy Policy](https://addy.io/privacy/) |
| [Vulnerability Feed](/docs/widgets#vulnerability-feed) | `https://services.nvd.nist.gov/rest/json/cves/2.0` | [NIST Privacy Policy](https://www.nist.gov/privacy-policy) |
| [Exchange Rate](/docs/widgets#exchange-rates) | `https://v6.exchangerate-api.com` | [ExchangeRateAPI Privacy Policy](https://www.exchangerate-api.com/terms) |
| | `https://raw.githubusercontent.com/Lissy93/currency-flags` | [GitHub's Privacy Policy](https://docs.github.com/en/github/site-policy/github-privacy-statement) |
| [Public Holidays](/docs/widgets#public-holidays) | `https://kayaposoft.com` | [jurajmajer/enrico](https://github.com/jurajmajer/enrico) |
| [Covid-19 Status](/docs/widgets#covid-19-status) | `https://disease.sh/v3/covid-19` | [disease-sh/api](https://github.com/disease-sh/api) |
| [Sports Scores](/docs/widgets#sports-scores) | `https://thesportsdb.com` | No Policy Available |
| [News Headlines](/docs/widgets#news-headlines) | `https://api.currentsapi.services` | [CurrentsAPI Privacy Policy](https://currentsapi.services/privacy) |
| [Mullvad Status](/docs/widgets#mullvad-status) | `https://am.i.mullvad.net` | [Mullvad Privacy Policy](https://mullvad.net/en/help/privacy-policy/) |
| [TFL Status](/docs/widgets#tfl-status) | `https://api.tfl.gov.uk` | [TFL Privacy Policy](https://tfl.gov.uk/corporate/privacy-and-cookies/) |
| [Stock Price History](/docs/widgets#stock-price-history) | `https://www.alphavantage.co` | [AlphaVantage Privacy Policy](https://www.alphavantage.co/privacy/) |
| [ETH Gas Prices](/docs/widgets#eth-gas-prices) | `https://www.ethgastracker.com` | [EthGasTracker](https://www.ethgastracker.com/) |
| [Joke](/docs/widgets#joke) | `https://v2.jokeapi.dev` | [SV443's Privacy Policy](https://sv443.net/privacypolicy/en) |
| [Chuck Norris Jokes](/docs/widgets#chuck-norris-quotes) | `https://api.chucknorris.io` | No Policy Available |
| [XKCD Comic](/docs/widgets#xkcd-comics) | `https://xkcd.vercel.app` | [XKCD](https://xkcd.com) |
| [Flight Data](/docs/widgets#flight-data) | `https://aerodatabox.p.rapidapi.com` | [AeroDataBox Privacy Policy](https://www.aerodatabox.com/#h.p_cxtiyzwf_wqd) |
| [Astronomy Picture of the Day](/docs/widgets#astronomy-picture-of-the-day) | `https://apod.as93.net` | [NASA's Privacy Policy](https://www.nasa.gov/privacy/) (via a proxy run by Dashy's author) |
| [GitHub Trending](/docs/widgets#github-trending) | `https://trend.doforce.xyz` | No Policy Available |
| [GitHub Profile Stats](/docs/widgets#github-profile-stats) | `https://api.github.com` | [GitHub's Privacy Policy](https://docs.github.com/en/github/site-policy/github-privacy-statement) |
| [Healthchecks Status](/docs/widgets#healthchecks-status) | `https://healthchecks.io` | [Health-Checks Privacy Policy](https://healthchecks.io/privacy/) |
| [Hacker News Trending](/docs/widgets#hackernews-trending) | `https://hacker-news.firebaseio.com` | [Y Combinator Privacy Policy](https://www.ycombinator.com/legal#privacy) |
| [Minecraft Server Status](/docs/widgets#minecraft-server) | `https://api.mcsrvstat.us` | No Policy Available |
| | `https://mc-heads.net` | [MC Heads](https://mc-heads.net/) |
| [MVG Departure](/docs/widgets#mvg-departure) / [MVG Connection](/docs/widgets#mvg-connection) | `https://www.mvg.de/api/fib/v2/` | No Policy Available |
| [RescueTime](/docs/widgets#rescuetime-overview) | `https://www.rescuetime.com` | [RescueTime Privacy Policy](https://www.rescuetime.com/privacy) |

Note: There are also many widgets that connect to self-hosted services (such as Pi-hole, AdGuard, Glances, Nextcloud, Proxmox, Uptime Kuma, etc.). These only make requests to your own configured server addresses and do not contact any third-party services.

### Proxied Requests

Some widget requests are made by the Dashy server, rather than your browser. If a widget is set to use the proxy (with `useProxy: true`), the request is sent to your Dashy server, which forwards it on to the target and passes the response back. This is needed for services which don't allow cross-origin requests. It also means the target sees your server's IP address, not your browser's. Any headers you've configured for that widget are included in the forwarded request.

Status checks and ping checks are also made from the server. If you don't use any of these features, you can disable the endpoints entirely by setting the `DISABLE_PROXY_ENDPOINTS=true` environment variable.

---

## Server-Side Data

Everything the Dashy server stores is kept in your `user-data` directory: your config file(s), plus a timestamped copy of the previous config, saved to `user-data/config-backups` each time you update the config through the UI. If you don't want these backups, set the `DISABLE_CONFIG_BACKUPS=true` environment variable. Old backups aren't cleaned up automatically, so if you've removed something sensitive from your config, remember to clear them out too.

There are no access logs, no analytics and no telemetry. The server prints some status info to the console, but doesn't write any log files.
