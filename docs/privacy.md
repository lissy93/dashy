# Privacy & Security

Dashy was built with privacy in mind.
Self-hosting your own apps and services is a great way to protect yourself from the mass data collection employed by big tech companies, and Dashy was designed to make self-hosting easier.

Dashy operates on the premise, that:
- No external data requests should ever be made, unless explicitly enabled by the user
- All code is 100% open source, clearly documented and intended to be easily auditable
- Privacy-respecting by default. No premium features, analytics, tracking or ads

This document outlines all network requests, data storage requirements, security configurations and data handling processes. 

> [!TIP]
> Btw (shameless plug), if you care about your privacy, you might also like [awesome-privacy](https://github.com/Lissy93/awesome-privacy/)!<br>

## Contents

- Privacy
  - [Browser Storage](#browser-storage)
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
- Security
  - [Dependencies](#dependencies)
  - [Securing your Environment](#securing-your-environment)
  - [Security Features](#security-features)
  - [Threat Model](#threat-model)
  - [Known Limitations](#known-limitations)
  - [Update & Patch Policy](#update--patch-policy)
  - [Reporting a Security Issue](#reporting-a-security-issue)

---

## Browser Storage

In order for user preferences to be persisted some data is stored locally in your browsers storage.
No personal info is kept here, none of this data can be accessed by other domains, no data is ever sent to any server without your prior consent, and all data is removed when no longer needed unless you delete it sooner.

The following section outlines all data that is stored in the browsers, as cookies, session storage or local storage.

### Cookies

> [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) will expire after their pre-defined lifetime.
> Dashy uses cookies for authentication, when enabled.

- `AUTH_TOKEN` - A unique token, generated from a hash of users credentials, to verify they are authenticated. Only used when auth is enabled.

### Session Storage

> [Session storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is deleted when the current session ends (tab / window is closed).
> Dashy uses session storage service worker status and error list.

- `SW_STATUS` - The current status of any service workers
- `ERROR_LOG` - List of recent errors

### Local Storage

> [Local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is persisted between sessions, and only deleted when manually removed.
> Dashy can use local storage to keep track of your preferences.

- `LANGUAGE` - The locale to show app text in
- `HIDE_INFO_NOTIFICATION` - Set to true once user dismissed welcome message, so that it's not shown again
- `LAYOUT_ORIENTATION` - Preferred section layout, either auto, horizontal, vertical or masonry
- `COLLAPSE_STATE` - Remembers which sections are collapsed
- `ICON_SIZE` - Size of items, either small, medium or large
- `THEME` - Users applied theme
- `CUSTOM_COLORS` - Any color modifications made to a given theme
- `BACKUP_ID` - If a backup has been made, the ID is stored here
- `BACKUP_HASH` - A unique hash of the previous backups meta data
- `HIDE_SETTINGS` - Lets user hide or show the settings menu
- `USERNAME` - If user logged in, store username. Only used to show welcome message, not used for auth
- `CONF_SECTIONS` - Array of sections, only used when user applies changes locally
- `PAGE_INFO` - Config page info, only used when user applies changes locally
- `APP_CONFIG` - App config, only used when user applies changes locally
- `MOST_USED` - If smart sort is used to order items by most used, store open count
- `LAST_USED` - If smart sort is used to order items by last used, store timestamps

### Deleting Stored Data

You can manually view and delete session storage, local storage and cookies at anytime. First [open](/docs/troubleshooting.md#how-to-open-browser-console) your browsers developer tools (usually <kbd>F12</kbd>), then under the Application tab select the storage category. Here you will see a list of stored data, and you can select any item and delete it.

---

## External Requests

By default, Dashy will not make any external requests, unless you configure it to. Some features (which are off by default) do require internet access, and this section outlines those features, the services used, and (where applicable) links to their privacy policies.

### Icons

#### Font Awesome

If either any of your sections, items or themes are using icons from font-awesome, then it will be automatically enabled. But you can also manually enable or disable it by setting `appConfig.enableFontAwesome` to `true` / `false`. Requests are made directly to Font-Awesome CDN, for more info, see the [Font Awesome Privacy Policy](https://fontawesome.com/privacy).

#### Material Design Icons

If either any of your sections, items or themes are mdi icons, then it will be automatically enabled. But you can also manually enable or disable it by setting `appConfig.enableMaterialDesignIcons` to `true` / `false`. Requests are made directly to Material-Design-Icons CDN, for more info, see the [Material Design Icons Website](https://materialdesignicons.com/).

#### Favicon Fetching

If an item's icon is set to `favicon`, then it will be auto-fetched from the corresponding URL. Since not all websites have their icon located at `/favicon.ico`, and if they do, it's often very low resolution (like `16 x 16 px`). Therefore, the default behavior is for Dashy to check if the URL is public, and if so will use an API to fetch the favicon. For self-hosted services, the favicon will be fetched from the default path, and no external requests will be made.

The default favicon API is [allesedv.com](https://favicon.allesedv.com/), but this can be changed by setting `appConfig.faviconApi` to an alternate source (`iconhorse`, `faviconkit`, `besticon`, `duckduckgo`, `google` and `allesedv` are supported). If you do not want to use any API, then you can set this property to `local`, and the favicon will be fetched from the default path. For hosted services, this will still incur an external request.

#### Generative Icons

If an item has the icon set to `generative`, then an external request it made to [Dice Bear](https://dicebear.com/) to fetch the uniquely generated icon. The URL of a given service is used as the key for generating the icon, but it is first hashed and encoded for basic privacy. For more info, please reference the [Dicebear Privacy Policy](https://avatars.dicebear.com/legal/privacy-policy)

As a fallback, if Dicebear fails, then [Evatar](https://evatar.io/) is used.

#### Self-Hosted Icons

If an item's icon uses the `sh-` prefix, icons are fetched from the [selfh.st icons](https://selfh.st/icons/) CDN at `https://cdn.jsdelivr.net/gh/selfhst/icons`. This only applies when you explicitly use the `sh-` prefix for an icon.

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

Dashy has an optional End-to-End encrypted [cloud backup feature](https://github.com/Lissy93/dashy/blob/master/docs/backup-restore.md). No data is ever transmitted unless you actively enable this feature through the UI.

All data is encrypted before being sent to the backend. This is done in [`CloudBackup.js`](https://github.com/Lissy93/dashy/blob/master/src/utils/CloudBackup.js), using [crypto.js](https://github.com/brix/crypto-js)'s AES method, using the users chosen password as the key. The data is then sent to a [Cloudflare worker](https://developers.cloudflare.com/workers/learning/how-workers-works) (a platform for running serverless functions), and stored in a [KV](https://developers.cloudflare.com/workers/learning/how-kv-works) data store.

Your selected password never leaves your device, and is hashed before being compared. It is only possible to restore a configuration if you have both the backup ID and decryption password. Because the data is encrypted on the client-side (before being sent to the cloud), it is not possible for a man-in-the-middle, government entity, website owner, or even Cloudflare to be able read any of your data.

### Web Search

Dashy has a primitive [web search feature](https://github.com/Lissy93/dashy/blob/master/docs/searching.md#web-search). No external requests are made, instead you are redirected to your chosen search engine (defaults to DuckDuckGo), using your chosen opening method.

This feature can be disabled under appConfig, with `webSearch: { disableWebSearch: true }`

### Initialization Page

When Dashy is first building (before the compiled app is ready), a static initialization page is displayed. This page loads a Google Font ([Fredoka One](https://fonts.google.com/specimen/Fredoka+One)) from `https://fonts.googleapis.com`. This only occurs during the build process, not during normal app usage. For more info, see [Google's Privacy Policy](https://policies.google.com/privacy).

### Anonymous Error Reporting

Error reporting is disabled by default, and no data will ever be sent without your explicit consent. In fact, the error tracking code isn't even imported unless you have actively enabled it. [Sentry](https://github.com/getsentry/sentry) is used for this, it's an open source error tracking and performance monitoring tool, used to identify any issues which occur in the production app (if you enable it).

The crash report includes the file or line of code that triggered the error, and a 2-layer deep stack trace. Reoccurring errors will also include the following user information: OS type (Mac, Windows, Linux, Android or iOS) and browser type (Firefox, Chrome, IE, Safari). Data scrubbing is enabled. IP address will not be stored. If any potentially identifiable data ever finds its way into a crash report, it will be automatically and permanently erased. All statistics collected are anonymized and stored securely, and are automatically deleted after 14 days. For more about privacy and security, see the [Sentry Docs](https://sentry.io/security/).

Enabling anonymous error reporting helps me to discover bugs I was unaware of, and then fix them, in order to make Dashy more reliable long term. Error reporting is activated by setting `appConfig.enableErrorReporting: true`.

If you need to monitor bugs yourself, then you can [self-host your own Sentry Server](https://develop.sentry.dev/self-hosted/), and use it by setting `appConfig.sentryDsn` to your Sentry instances [Data Source Name](https://docs.sentry.io/product/sentry-basics/dsn-explainer/), then just enable error reporting in Dashy.

### Widgets

Dashy supports [Widgets](/docs/widgets.md) for displaying dynamic content. Below is a list of all widgets that make external data requests, along with the endpoint they call and a link to the Privacy Policy of that service.

| Widget | Endpoint | Privacy Policy |
|---|---|---|
| [Weather](/docs/widgets.md#weather) / [Weather Forecast](/docs/widgets.md#weather-forecast) | `https://api.openweathermap.org` | [OWM Privacy Policy](https://openweather.co.uk/privacy-policy) |
| [RSS Feed](/docs/widgets.md#rss-feed) | `https://api.rss2json.com/v1/api.json` | [Rss2Json Privacy Policy](https://rss2json.com/privacy-policy) |
| [IP Address](/docs/widgets.md#public-ip) | `https://free.freeipapi.com/api/json` | [FreeIPAPI](https://freeipapi.com/) |
| | `https://ipinfo.io/json` | [IPInfo Privacy Policy](https://ipinfo.io/privacy-policy) |
| | `https://api.ipquery.io/` | [IPQuery](https://ipquery.io/) |
| | `http://ip-api.com/json` | [IP-API Privacy Policy](https://ip-api.com/docs/legal) |
| | `https://api.ipgeolocation.io/ipgeo` | [IPGeoLocation Privacy Policy](https://ipgeolocation.io/privacy.html) |
| [IP Blacklist](/docs/widgets.md#ip-blacklist) | `https://api.blacklistchecker.com` | [Blacklist Checker Privacy Policy](https://blacklistchecker.com/privacy) |
| [Domain Monitor](/docs/widgets.md#domain-monitor) | `https://api.whoapi.com` | [WhoAPI Privacy Policy](https://whoapi.com/privacy-policy/) |
| [Crypto Watch List](/docs/widgets.md#crypto-watch-list) / [Token Price History](/docs/widgets.md#crypto-token-price-history) | `https://api.coingecko.com` | [CoinGecko Privacy Policy](https://www.coingecko.com/en/privacy) |
| [Wallet Balance](/docs/widgets.md#wallet-balance) | `https://api.blockcypher.com/` | [BlockCypher Privacy Policy](https://www.blockcypher.com/privacy.html) |
| [Code::Stats](/docs/widgets.md#code-stats) | `https://codestats.net` | [Code::Stats Privacy Policy](https://codestats.net/tos#privacy) |
| [addy.io](/docs/widgets.md#addyio) | `https://app.addy.io` | [addy.io Privacy Policy](https://addy.io/privacy/) |
| [Vulnerability Feed](/docs/widgets.md#vulnerability-feed) | `https://services.nvd.nist.gov/rest/json/cves/2.0` | [NIST Privacy Policy](https://www.nist.gov/privacy-policy) |
| [Exchange Rate](/docs/widgets.md#exchange-rates) | `https://v6.exchangerate-api.com` | [ExchangeRateAPI Privacy Policy](https://www.exchangerate-api.com/terms) |
| [Public Holidays](/docs/widgets.md#public-holidays) | `https://kayaposoft.com` | [jurajmajer/enrico](https://github.com/jurajmajer/enrico) |
| [Covid-19 Status](/docs/widgets.md#covid-19-status) | `https://disease.sh/v3/covid-19` | [disease-sh/api](https://github.com/disease-sh/api) |
| [Sports Scores](/docs/widgets.md#sports-scores) | `https://thesportsdb.com` | No Policy Available |
| [News Headlines](/docs/widgets.md#news-headlines) | `https://api.currentsapi.services` | [CurrentsAPI Privacy Policy](https://currentsapi.services/privacy) |
| [Mullvad Status](/docs/widgets.md#mullvad-status) | `https://am.i.mullvad.net` | [Mullvad Privacy Policy](https://mullvad.net/en/help/privacy-policy/) |
| [TFL Status](/docs/widgets.md#tfl-status) | `https://api.tfl.gov.uk` | [TFL Privacy Policy](https://tfl.gov.uk/corporate/privacy-and-cookies/) |
| [Stock Price History](/docs/widgets.md#stock-price-history) | `https://www.alphavantage.co` | [AlphaVantage Privacy Policy](https://www.alphavantage.co/privacy/) |
| [ETH Gas Prices](/docs/widgets.md#eth-gas-prices) | `https://ethgas.watch` | [wslyvh/ethgaswatch](https://github.com/wslyvh/ethgaswatch) |
| [Joke](/docs/widgets.md#joke) | `https://v2.jokeapi.dev` | [SV443's Privacy Policy](https://sv443.net/privacypolicy/en) |
| [Chuck Norris Jokes](/docs/widgets.md#chuck-norris-jokes) | `https://api.chucknorris.io` | No Policy Available |
| [XKCD Comic](/docs/widgets.md#xkcd-comic) | `https://xkcd.vercel.app` | [XKCD](https://xkcd.com) |
| [Flight Data](/docs/widgets.md#flight-data) | `https://aerodatabox.p.rapidapi.com` | [AeroDataBox Privacy Policy](https://www.aerodatabox.com/#h.p_CXtIYZWF_WQd) |
| [Astronomy Picture of the Day](/docs/widgets.md#astronomy-picture-of-the-day) | `https://apod.as93.net` | [NASA's Privacy Policy](https://www.nasa.gov/about/highlights/HP_Privacy.html) |
| [GitHub Trending](/docs/widgets.md#github-trending) | `https://trend.doforce.xyz` | No Policy Available |
| [GitHub Profile Stats](/docs/widgets.md#github-profile-stats) | `https://github-readme-stats.vercel.app` | [GitHub's Privacy Policy](https://docs.github.com/en/github/site-policy/github-privacy-statement) |
| [Healthchecks Status](/docs/widgets.md#healthchecks-status) | `https://healthchecks.io` | [Health-Checks Privacy Policy](https://healthchecks.io/privacy/) |
| [Hacker News Trending](/docs/widgets.md#hacker-news-trending) | `https://hacker-news.firebaseio.com` | [Y Combinator Privacy Policy](https://www.ycombinator.com/legal#privacy) |
| [Minecraft Server Status](/docs/widgets.md#minecraft-server-status) | `https://api.mcsrvstat.us` | No Policy Available |
| [MVG](/docs/widgets.md#mvg) | `https://www.mvg.de/api/fib/v2/` | No Policy Available |
| [RescueTime](/docs/widgets.md#rescue-time) | `https://www.rescuetime.com` | [RescueTime Privacy Policy](https://www.rescuetime.com/privacy) |

Note: There are also many widgets that connect to self-hosted services (such as Pi-hole, AdGuard, Glances, Nextcloud, Proxmox, Uptime Kuma, etc.). These only make requests to your own configured server addresses and do not contact any third-party services.

---

## Dependencies

As with most web projects, Dashy relies on several [dependencies](https://github.com/Lissy93/dashy/blob/master/docs/credits.md#dependencies-).

Dependencies can introduce security vulnerabilities, but since all these packages are open source any issues are usually very quickly spotted. Dashy is using Snyk for dependency security monitoring, and you can see [the latest report here](https://snyk.io/test/github/lissy93/dashy). If any issue is detected by Snyk, a note about it will appear at the top of the Readme, and will usually be fixed within 48 hours.

Note that packages listed under `devDependencies` section are only used for building the project, and are not included in the production environment.

---

## Securing your Environment

There is very little complexity involved with Dashy, and therefore the attack surface is reasonably small, but it is still important to follow best practices for all your self-hosted apps:

- **Use SSL/HTTPS** for securing traffic in transit, see [Management Docs: SSL Certificates](/docs/management.md#ssl-certificates)
- **Configure authentication** to prevent unauthorized access, see [Authentication Docs](/docs/authentication.md). For internet-facing instances, use [Keycloak](/docs/authentication.md#keycloak), [OIDC](/docs/authentication.md#oidc), or an [alternative server-side method](/docs/authentication.md#alternative-authentication-methods)
- **Place behind a reverse proxy** if exposing to the internet, see [Management Docs: Network Exposure](/docs/management.md#network-exposure)
- **Harden your containers** if running in Docker, see [Management Docs: Container Security](/docs/management.md#container-security)
- **Keep Dashy and your system up-to-date** to ensure known vulnerabilities are patched
- **Configure firewall rules** to restrict access to only necessary ports and networks
- **Use a VPN** for private access without exposing Dashy to the public internet
- **Follow [Docker security best practices](https://docs.docker.com/engine/security/)** including running as non-root, limiting capabilities, and using read-only volumes

---

## Security Features

### Subresource Integrity

[Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) or SRI is a security feature that enables browsers to verify that resources they fetch are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched resource must match. This prevents the app from loading any resources that have been manipulated, by verifying the files hashes. It safeguards against the risk of an attacker injecting arbitrary malicious content into any files served up via a CDN.

Dashy supports SRI, and it is recommended to enable this if you are hosting your dashboard via a public CDN. To enable SRI, set the `INTEGRITY` environmental variable to `true`.

### SSL

Native SSL support is enabled, for setup instructions, see the [Management Docs](/docs/management.md#ssl-certificates)

### Authentication

Dashy supports built-in auth, server-based SSO using Keycloak or any OIDC provider, and header-based authentication for reverse proxy setups. Full details of which, along with alternate authentication methods can be found in the [Authentication Docs](/docs/authentication.md). If your dashboard is exposed to the internet and/ or contains any sensitive info it is strongly recommended to configure access control with Keycloak, OIDC, or another server-side method.

### Configuration Lockdown

Dashy provides several options to restrict what users can modify:

- `appConfig.preventWriteToDisk` - Prevents config changes from being saved to the server
- `appConfig.preventLocalSave` - Prevents config changes from being saved to browser storage
- `appConfig.disableConfiguration` - Hides the config UI from all users
- `appConfig.disableConfigurationForNonAdmin` - Hides the config UI for non-admin users

These can be combined with the `admin` and `normal` user roles to give fine-grained control. Admin users can save config changes, while normal users have read-only access. For more details, see the [Authentication Docs: Permissions](/docs/authentication.md#permissions).

### Disabling Features

You may wish to disable features that you don't want to use, if they involve storing data in the browser or making network requests.
- To disable smart-sort (uses local storage), set `appConfig.disableSmartSort: true`
- To disable update checks (makes external request to GH), set `appConfig.disableUpdateChecks: true`
- To disable web search (redirect to external / internal content), set `appConfig.webSearch.disableWebSearch: true`
- To keep status checks disabled (external / internal requests), set `appConfig.statusCheck: false`
- To keep ping checks disabled (external / internal requests), set `appConfig.pingCheckEnabled: false`
- To keep font-awesome icons disabled (external requests), set `appConfig.enableFontAwesome: false`
- To keep error reporting disabled (external requests and data collection), set `appConfig.enableErrorReporting: false`
- To keep the service worker disabled (stores cache of app in browser data), set `appConfig.enableServiceWorker: false`

---

## Threat Model

Dashy is a statically-hosted dashboard application, designed to be self-hosted on a private network. This threat model outlines the intended deployment context, trust boundaries, known risks and accepted trade-offs, to help users assess whether Dashy is appropriate for their environment.

### Intended Deployment

Dashy is designed to run on a **private local network** (e.g. a home lab), accessed by a **small number of trusted users**. It is a convenience tool for organizing links to self-hosted services - it is not designed to protect sensitive resources or act as an access control layer.

If exposed to the internet, Dashy **must** be placed behind a reverse proxy with server-side authentication (e.g. Authelia, Authentik, Cloudflare Access). The built-in client-side auth is a convenience feature for private networks, not a security boundary.

### Trust Boundaries

| Boundary | Trusted Side | Untrusted Side |
|---|---|---|
| Local network | LAN users, self-hosted services | The public internet |
| Config file (`conf.yml`) | Server admin who writes the config | End users who view the dashboard |
| Browser storage | The current browser session | Other domains, other users of the same device |
| CORS proxy / status checks | Configured target URLs (set by admin) | Arbitrary URLs (if auth is not enabled) |

### Assets

| Asset | Description | Storage |
|---|---|---|
| Dashboard configuration | Service URLs, section layout, app settings | `conf.yml` on server, optionally cached in browser localStorage |
| User credentials | SHA-256 password hashes, Keycloak/OIDC client IDs | `conf.yml` on server |
| API keys | Keys for widget services (weather, stocks, etc.) | `conf.yml` on server or environment variables |
| Auth tokens | Session token derived from credentials | Browser cookie (`dashyAuthToken`) |
| User preferences | Theme, layout, language, collapsed sections | Browser localStorage |

### When Dashy is NOT the Right Choice

- You need a **multi-tenant** dashboard with per-user audit trails
- You are deploying on the **public internet without a reverse proxy**
- Your dashboard contains **secrets or credentials** that must be protected from all users who can reach the server
- You require **FIPS-compliant** or **SOC 2** certified software

---

## Known Limitations

| Report | Response |
|---|---|
| "Client-side auth can be bypassed via browser dev tools" | Correct (only if neither `ENABLE_HTTP_AUTH` is set, nor any other auth mode). Client-side auth is a convenience for private networks, not a security boundary. Use server-side auth for untrusted environments. |
| "CORS proxy can make requests to internal services" | Correct. The CORS proxy is designed to reach services on your network. It is protected by auth middleware when auth is enabled. Do not expose Dashy without auth on an untrusted network. |
| "Status checks can be used for SSRF" | Status check target URLs are set by the server admin in `conf.yml`, not by end users. If auth is enabled, the endpoint is protected. |
| "Password hashes are stored in plaintext in conf.yml" | They are SHA-256 hashes, not plaintext passwords. The config file should be readable only by the server admin, and protected by HTTP auth when served. |
| "localStorage/cookies are not encrypted" | Browser storage is scoped to the origin and inaccessible to other domains. On a shared device, use your browser's profile isolation. |
| "No CSRF protection" | Dashy's state-changing operations (config save) are protected by auth middleware. CSRF is a low risk on a private network dashboard. |
| "Docker container runs as root" | The container is sandboxed. For hardened deployments, override with `--user` flag or configure in your Docker Compose file as described in the [container security docs](/docs/management.md#container-security). |
| "Auth cookie is not HttpOnly/Secure" | The token is needed by client-side JavaScript for auth state. On a private network over plain HTTP, the `Secure` flag would break auth. Use HTTPS + a reverse proxy to add these flags if needed. |
| "Iframe/embed widget can load arbitrary URLs" | The widget config is written by the server admin, not end users. If you don't trust your config authors, disable the config editor with `disableConfiguration`. |
| "RSS widget renders HTML content" | RSS content is sanitized with DOMPurify before rendering. Script tags, event handlers and other dangerous elements are stripped. |
| "No Content-Security-Policy headers" | CSP should be configured at the reverse proxy layer, since the correct policy depends on which widgets and icon CDNs you use. Dashy can't set a universal CSP that works for all configurations. |
| "Config backups are not encrypted at rest" | Backups are stored server-side alongside the original config. If an attacker has filesystem access, they already have `conf.yml`. Encryption at rest is the responsibility of the host OS/volume. |
| "No rate limiting on endpoints" | Rate limiting should be applied at the reverse proxy layer, where it can be tuned per-deployment. Dashy is not designed to be directly exposed to untrusted traffic. |

---

## Update & Patch Policy

We follow Semantic Versioning for all releases. Security fixes are shipped as patch releases as quickly as possible and are published via immutable Git tags and Docker image tags. Users are encouraged to pin to a specific version in production and monitor releases on GitHub for security updates. The `:latest` Docker tag is provided for convenience but should not be relied on in production environments.

---

## Reporting a Security Issue

Please see our [Security.md](https://github.com/Lissy93/dashy/?tab=security-ov-file) doc for how to report issues.
We have an actively monitored security mailbox supporting PGP, as well as a GitHub Advisories vulnerability reporting program.
