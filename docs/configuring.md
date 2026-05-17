# Configuring

All app configuration is specified in [`/user-data/conf.yml`](https://github.com/Lissy93/dashy/blob/master/user-data/conf.yml) which is in [YAML Format](https://yaml.org/) format. If you're using Docker, this file can be passed in as a volume. Changes can either be made directly to this file, or done [through the UI](#editing-config-through-the-ui). From the UI you can also export, backup, reset, validate and download your configuration file.

## There are three ways to edit the config

- **Directly in the YAML file** _(5/5 reliability, 3/5 usability)_
  - Write changes directly to the conf.yml file, optionally using one of the templates provided. This can be done in your favorite editor and uploading to your server, or directly editing the file via SSH, but the easiest method would be to use [Code Server](https://github.com/coder/code-server)
- **UI JSON Editor** _(4/5 reliability, 4/5 usability)_
  - From the UI, under the config menu there is a JSON editor, with built-in validation, documentation and advanced options
- **UI Visual Editor** _(3/5 reliability, 5/5 usability)_
  - From the UI, enter the Interactive Edit Mode, then click any part of the page to edit. Changes are previewed live, and then saved to disk
- **REST API** _(Coming soon)_
  - Programmatically edit config either through the command line, using a script or a third-party application

## Tips

- You may find it helpful to look at some sample config files to get you started, a collection of which can be found [here](https://gist.github.com/Lissy93/000f712a5ce98f212817d20bc16bab10)
- You can check that your config file fits the schema, by running `yarn validate-config`
- After modifying your config, the app needs to be recompiled, by running `yarn build`  - this happens automatically if you're using Docker
- It is recommended to keep a backup of your config file. You can download it under Config menu, or use the [Cloud Backup](./docs/backup-restore.md) feature.
- You can make use of YAML features, like anchors, comments, multi-line strings, etc to reuse attributes and keep your config file readable
- Once you have finished configuring your dashboard, you can choose to [disable UI config](#preventing-changes) if you wish
- All fields are optional, unless otherwise stated.

The following file provides a reference of all supported configuration options.

## Contents

- [**`pageInfo`**](#pageinfo) - Header text, footer, title, navigation, etc
  - [`navLinks`](#pageinfonavlinks-optional) - Links to display in the navigation bar
- [**`pages`**](#pages-optional) - List of additional config files, for multi-page dashboards
- [**`appConfig`**](#appconfig-optional) - Main application settings
  - [`webSearch`](#appconfigwebsearch-optional) - Configure web search engine options
  - [`hideComponents`](#appconfighidecomponents-optional) - Show/ hide page components
  - [`auth`](#appconfigauth-optional) - Built-in authentication setup
    - [`users`](#appconfigauthusers-optional) - List or users (for simple auth)
    - [`keycloak`](#appconfigauthkeycloak-optional) - Auth config for Keycloak
    - [`headerAuth`](#appconfigauthheaderauth-optional) - Auth config for HeaderAuth
- [**`sections`**](#section) - List of sections
  - [`displayData`](#sectiondisplaydata-optional) - Section display settings
    - [`show/hideForKeycloakUsers`](#sectiondisplaydatahideforkeycloakusers-sectiondisplaydatashowforkeycloakusers-itemdisplaydatahideforkeycloakusers-and-itemdisplaydatashowforkeycloakusers) - Set user controls
  - [`icon`](#sectionicon-and-sectionitemicon) - Icon for a section
  - [`items`](#sectionitem) - List of items
    - [`icon`](#sectionicon-and-sectionitemicon) - Icon for an item
    - [`displayData`](#itemdisplaydata-optional) - Item display settings
      - [`show/hideForKeycloakUsers`](#sectiondisplaydatahideforkeycloakusers-sectiondisplaydatashowforkeycloakusers-itemdisplaydatahideforkeycloakusers-and-itemdisplaydatashowforkeycloakusers) - Set user controls
  - [`widgets`](#sectionwidget-optional) - List of widgets
- [**Notes**](#notes)
  - [Editing Config through the UI](#editing-config-through-the-ui)
  - [About YAML](#about-yaml)
  - [Config Saving Methods](#config-saving-methods)
  - [Preventing Changes](#preventing-changes)
  - [Example](#example)

---

## Top-Level Fields

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`pageInfo`** | `object` | Required | Basic meta data like title, description, nav bar links, footer text. See [`pageInfo`](#pageinfo)
**`appConfig`** | `object` | _Optional_ | Settings related to how the app functions, including API keys and global styles. See [`appConfig`](#appconfig-optional)
**`sections`** | `array` | Required | An array of sections, each containing an array of items, which will be displayed as links. See [`section`](#section)
**`pages`** | `array` | _Optional_ | An array additional config files, used for multi-page dashboards. See [`pages`](#pages-optional)

**[⬆️ Back to Top](#configuring)**

## `PageInfo`

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`title`** | `string` |  Required | Your dashboard title, displayed in the header and browser tab
**`description`** | `string` | _Optional_ | Description of your dashboard, also displayed as a subtitle
**`navLinks`** | `array` | _Optional_ | Optional list of a maximum of 6 links, which will be displayed in the navigation bar. See [`navLinks`](#pageinfonavlinks-optional)
**`footer`** | `string` | _Optional_ | Text to display in the footer. When omitted, no footer is rendered. Supports inline HTML (sanitized before render)
**`logo`** | `string` | _Optional_ | The path to an image to display in the header (to the right of the title). This can be either local, where `/` is the root of `./public`, or any remote image, such as `https://i.ibb.co/yhbt6CY/dashy.png`. It's recommended to scale your image down, so that it doesn't impact load times
**`favicon`** | `string` | _Optional_ | URL or path to a custom favicon shown in the browser tab. Can be absolute (`https://...`), root-relative (`/icons/x.png`), or a `data:` URI
**`color`** | `string` | _Optional_ | Theme colour applied to the browser chrome (mobile address bar). Any valid CSS color (e.g. `#ff00a7`) is accepted

**[⬆️ Back to Top](#configuring)**

## `pageInfo.navLinks` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`title`** | `string` |  Required | The text to display on the link button
**`path`** | `string` | Required | The URL to navigate to when clicked. Can be relative (e.g. `/about`) or absolute (e.g. `https://example.com` or `http://192.168.1.1`)
**`target`** | `string` |  _Optional_ | The opening method (external links only). Can be either `newtab`, `sametab`, `newwindow`, `top` or `parent`. Defaults to `newtab`

**[⬆️ Back to Top](#configuring)**

## `pages[]` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`name`** | `string` |  Required | A unique name for that page
**`path`** | `string` |  Required | The path (local or remote) to the config file to use.<br>For files located within `/user-data`, you only need to specify filename, for externally hosted files you must include the full URL

For more info, see the[Multi-Page docs](/docs/pages-and-sections.md#multi-page-support)

**[⬆️ Back to Top](#configuring)**

## `appConfig` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`language`** | `string` | _Optional_ | The 2 (or 4-digit) [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for your language, e.g. `en` or `en-GB`. This must be a language that the app has already been [translated](https://github.com/Lissy93/dashy/tree/master/src/assets/locales) into. If your language is unavailable, Dashy will fallback to English. By default Dashy will attempt to auto-detect your language, although this may not work on some privacy browsers.
**`startingView`** | `enum` | _Optional_ | Which view to land on when visiting `/`. One of `home`, `minimal` or `workspace`. Defaults to `home`. Applied at runtime, so no rebuild is needed. You can always switch views from the UI. (Legacy value `default` is accepted as an alias for `home`.)
**`defaultOpeningMethod`** | `enum` | _Optional_ | The default opening method for items, if no `target` is specified for a given item. Can be either `newtab`, `sametab`, `modal`, `workspace`, `clipboard`, `top` or `parent`. Defaults to `newtab`
**`statusCheck`** | `boolean` | _Optional_ | When set to `true`, Dashy will ping each of your services and display their status as a dot next to each item. This can be overridden by setting `statusCheck` under each item. Defaults to `false`
**`statusCheckInterval`** | `number` | _Optional_ | The number of seconds between checks. If set to `0` then service will only be checked on initial page load, which is usually the desired functionality. If value is less than `10` you may experience a hit in performance. Defaults to `0`
**`statusCheckAccessibility`** | `boolean` | _Optional_ | When set to `true`, status indicators will use distinct shapes to indicate status for color-blind users. Defaults to `false`
**`pingCheckEnabled`** | `boolean` | _Optional_ | When set to `true`, Dashy will make a real ICMP ping to each of your hosts and display their status as a dot next to each item. This can be overridden by setting `pingCheckEnabled` under each item. Defaults to `false`
**`pingCheckInterval`** | `number` | _Optional_ | The number of seconds between checks. If set to `0` then service will only be checked on initial page load. The value is limited to `5` seconds min to prevent performance issues. Defaults to `0`
**`pingCheckAccessibility`** | `boolean` | _Optional_ | When set to `true`, status indicators will use distinct shapes to indicate status for color-blind users. Defaults to `false`
**`pingCheckCount`** | `number` | _Optional_ | The number of ping ICMP packets sent to the host per check. This can be overridden by setting `pingCheckCount` under each item. If set to `0` then `3` packets will be sent. The value is limited to `5` packets max to prevent performance issues. Defaults to `0`
**`pingCheckTimeout`** | `number` | _Optional_ | The number of milliseconds to wait for a ping to complete. This can be overriden by setting `pingCheckTimeout` under each item. If set to `0` then it uses the same value as `pingCheckInterval` but converted in milliseconds. The value is limited to 1000 ms per `pingCheckCount` to prevent performance issues. Defaults to `0`
**`webSearch`** | `object` | _Optional_ | Configuration options for the web search feature, set your default search engine, opening method or disable web search. See [`webSearch`](#appconfigwebsearch-optional)
**`backgroundImg`** | `string` | _Optional_ | Path to an optional full-screen app background image. This can be either remote (http) or local (relative to /app/public/item-icons/ inside the container). Note that this will slow down initial load
**`enableFontAwesome`** | `boolean` | _Optional_ | If set to `true` font-awesome will be loaded, if set to `false` they will not be. if left blank font-awesome will be enabled only if required by 1 or more icons
**`enableMaterialDesignIcons`** | `boolean` | _Optional_ | If set to `true` mdi icons will be loaded, if set to `false` they will not be. Where `true` is enabled, if left blank material design icons will be enabled only if required by 1 or more icons
**`fontAwesomeKey`** | `string` | _Optional_ | If you have a font-awesome key, then you can use it here and make use of premium icons. It is a 10-digit alpha-numeric string from you're FA kit URL  (e.g. `13014ae648`)
**`faviconApi`** | `enum` | _Optional_ | Only applicable if you are using favicons for item icons. Specifies which service to use to resolve favicons. Set to `local` to do this locally, without using an API. Services running locally will use this option always. Available options are: `local`, `allesedv`, `iconhorse`, `faviconkit`, `duckduckgo`, `yandex`, `google`, `besticon`, `webmasterapi` and `mcapi`. Defaults to `allesedv`. See [Icons](/docs/icons.md#favicons) for more info
**`auth`** | `object` | _Optional_ | All settings relating to user authentication. See [`auth`](#appconfigauth-optional)
**`defaultIcon`** | `string` | _Optional_ | An icon to be applied to any items, which don't already have an icon set. See [Icon Docs](/docs/icons.md#default-icon) for more info
**`layout`** | `enum` | _Optional_ | Layout for homepage, one of `auto`, `horizontal`, `vertical` or `masonry`. Defaults to `auto`. Specifies the layout and direction of how sections are positioned on the home screen. `auto` uses a responsive CSS grid where each section's footprint is controlled by `displayData.cols` and `displayData.rows`. `masonry` uses a responsive grid where heights follow content, so shorter sections flow into the gaps left by taller neighbours (`rows` is ignored, `cols` still controls width). This can also be modified and overridden from the UI.
**`iconSize`** | `enum` | _Optional_ | The size of link items / icons. Can be either `small`, `medium,` or `large`. Defaults to `medium`. This can also be set directly from the UI.
**`colCount`** | `number` | _Optional_ | The number of columns of sections displayed on the homepage, using the default view. Should be in integer between `1` and `8`. Note that by default this is applied responsively, based on current screen size, and specifying a value here will override this behavior, which may not be desirable.
**`contentMaxWidth`** | `string` or `number` | _Optional_ | Sets the max width of the main sections area on the homepage, overriding the responsive default. Can be a percentage, or any CSS unit
**`theme`** | `string` | _Optional_ | The default theme for first load (you can change this later from the UI)
**`dayTheme`** | `string` | _Optional_ | Theme to apply when the OS is set to light mode. Overrides `theme` on initial load
**`nightTheme`** | `string` | _Optional_ | Theme to apply when the OS is set to dark mode. Overrides `theme` on initial load
**`cssThemes`** | `string[]` | _Optional_ | An array of custom theme names which can be used in the theme switcher dropdown
**`customColors`** | `object`| _Optional_ | Enables you to apply a custom color palette to any given theme. Use the theme name (lowercase) as the key, for an object including key-value-pairs, with the color variable name as keys, and 6-digit hex code as value. See [Theming](/docs/theming.md#modifying-theme-colors) for more info
**`externalStyleSheet`** | `string`  or `string[]` | _Optional_ | Either a URL to an external stylesheet or an array or URLs, which can be applied as themes within the UI
**`customCss`** | `string` | _Optional_ | Raw CSS that will be applied to the page. This can also be set from the UI. Please minify it first.
**`hideComponents`** | `object` | _Optional_ | A list of key page components (header, nav, search, settings) that are present by default, but can be removed using this option. See [`appConfig.hideComponents`](#appconfighideComponents-optional)
**`enableMultiTasking`** | `boolean` | _Optional_ | If set to true, will keep apps open in the background when in the workspace view. Useful for quickly switching between multiple sites, and preserving their state, but comes at the cost of performance.
**`workspaceLandingUrl`** | `string` | _Optional_ | The URL or an app, service or website to launch when the workspace view is opened, before another service has been launched
**`preventWriteToDisk`** | `boolean` | _Optional_ | If set to `true`, users will be prevented from saving config changes to disk through the UI
**`preventLocalSave`** | `boolean` | _Optional_ | If set to `true`, users will be prevented from applying config changes to local storage
**`disableConfiguration`** | `boolean` | _Optional_ | If set to true, no users will be able to view or edit the config through the UI
**`disableConfigurationForNonAdmin`** | `boolean` | _Optional_ | If set to true, only admin users will be able to view or edit the config through the UI. disableConfiguration must not be set to true.
**`widgetsAlwaysUseProxy`** | `boolean` | _Optional_ | If set to `true`, requests made by widgets will always be proxied, same as setting `useProxy: true` on each widget. Note that this may break some widgets.
**`showSplashScreen`** | `boolean` | _Optional_ | If set to `true`, a loading screen will be shown. Defaults to `false`.
**`enableErrorReporting`** | `boolean` | _Optional_ | Enable reporting of unexpected errors and crashes. This is off by default, and **no data will ever be captured unless you explicitly enable it**. Turning on error reporting helps previously unknown bugs get discovered and fixed. Dashy uses [Sentry](https://github.com/getsentry/sentry) for error reporting. Defaults to `false`.
**`sentryDsn`** | `boolean` | _Optional_ | If you need to monitor errors in your instance, then you can use Sentry to collect and process bug reports. Sentry can be self-hosted, or used as SaaS, once your instance is setup, then all you need to do is pass in the DSN here, and enable error reporting. You can learn more on the [Sentry DSN Docs](https://docs.sentry.io/product/sentry-basics/dsn-explainer/). Note that this will only ever be used if `enableErrorReporting` is explicitly enabled.
**`disableSmartSort`** | `boolean` | _Optional_ | For the most-used and last-used app sort functions to work, a basic open-count is stored in local storage. If you do not want this to happen, then disable smart sort here, but you wil no longer be able to use these sort options. Defaults to `false`.
**`disableUpdateChecks`** | `boolean` | _Optional_ | If set to true, Dashy will not check for updates. Defaults to `false`.
**`enableServiceWorker`** | `boolean` | _Optional_ | Service workers cache web applications to improve load times and offer basic offline functionality, and are disabled by default in Dashy. The service worker can sometimes cause older content to be cached, requiring the app to be hard-refreshed. If you do not want SW functionality, or are having issues with caching, set this property to `false` to disable all service workers.
**`enableAuthProxyCompat`** | `boolean` | _Optional_ | Only relevant when `enableServiceWorker` is `true` and when Dashy sits behind an authentication proxy (such as Cloudflare Zero Trust or Authelia). Set this to `true` to detect that redirect on load, unregister the service worker, and reload so re-authentication can proceed. Defaults to `false`.
**`disableContextMenu`** | `boolean` | _Optional_ | If set to `true`, the custom right-click context menu will be disabled. Defaults to `false`.

**[⬆️ Back to Top](#configuring)**

## `appConfig.auth` _(optional)_

> [!NOTE]
> Since the auth is initiated in the main app entry point (for security), a rebuild is required to apply changes to the auth configuration.
> Run `yarn build` in the root directory, then restart the server.

> [!WARNING]
> Built-in auth should **not be used** for security-critical applications, or if your Dashy instance is publicly accessible.
> For these, it is recommended to use an [alternate authentication method](/docs/authentication.md#alternative-authentication-methods).

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`users`** | `array` | _Optional_ | An array of objects containing usernames and hashed passwords. If this is not provided, then authentication will be off by default, and you will not need any credentials to access the app. See [`appConfig.auth.users`](#appconfigauthusers-optional). <br>**Note** this method of authentication is handled on the client side, so for security critical situations, it is recommended to use an [alternate authentication method](/docs/authentication.md#alternative-authentication-methods).
**`enableKeycloak`** | `boolean` | _Optional_ | If set to `true`, then authentication using Keycloak will be enabled. Note that you need to have an instance running, and have also configured `auth.keycloak`. Defaults to `false`
**`keycloak`** | `object` | _Optional_ | Config options to point Dashy to your Keycloak server. Requires `enableKeycloak: true`. See  [`auth.keycloak`](#appconfigauthkeycloak-optional) for more info
**`enableHeaderAuth`** | `boolean` | _Optional_ | If set to `true`, then authentication using HeaderAuth will be enabled. Note that you need to have your web server/reverse proxy running, and have also configured `auth.headerAuth`. Defaults to `false`
**`headerAuth`** | `object` | _Optional_ | Config options to point Dashy to your headers for authentication. Requires `enableHeaderAuth: true`. See  [`auth.headerAuth`](#appconfigauthheaderauth-optional) for more info
**`enableOidc`** | `boolean` | _Optional_ | If set to `true`, then authentication using OIDC will be enabled. Note that you need to have a configured OIDC server and configure it with `auth.oidc`. Defaults to `false`
**`oidc`** | `object` | _Optional_ | Config options to point Dash to your OIDC configuration. Request `enableOidc: true`. See [`auth.oidc`](#appconfigauthoidc-optional) for more info
**`enableGuestAccess`** | `boolean` | _Optional_ | When set to `true`, an unauthenticated user will be able to access the dashboard, with read-only access, without having to login. Requires `auth.users` to be configured. Defaults to `false`.

For more info, see the **[Authentication Docs](/docs/authentication.md)**

**[⬆️ Back to Top](#configuring)**

## `appConfig.auth.users` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`user`** | `string` | Required | Username to log in with
**`hash`** | `string` | Required | A SHA-256 hashed password
**`type`** | `string` | _Optional_ | The user type, either admin or normal

**[⬆️ Back to Top](#configuring)**

## `appConfig.auth.keycloak` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`serverUrl`** | `string` | Required | The URL (or URL/ IP + Port) where your keycloak server is running
**`realm`** | `string` | Required | The name of the realm (must already be created) that you want to use
**`clientId`** | `string` | Required | The Client ID of the client you created for use with Dashy
**`idpHint`** | `string` | _Optional_ | The alias of an Identity Provider configured in your realm. If set, Keycloak will skip its login page and redirect straight to that external IdP
**`legacySupport`** | `boolean` | _Optional_ | If using Keycloak 17 or older, then set this to `true`

**[⬆️ Back to Top](#configuring)**

## `appConfig.auth.headerAuth` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`userHeader`** | `string` | _Optional_ | The HTTP header name containing the authenticated username (default: `Remote-User`). Case insensitive
**`proxyWhitelist`** | `array` | Required | An array of upstream proxy server IPs to accept authenticated requests from

**[⬆️ Back to Top](#configuring)**

## `appConfig.auth.oidc` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`clientId`** | `string` | Required | The client id registered in the OIDC server
**`endpoint`** | `string` | Required | The URL of the OIDC server that should be used.
**`adminRole`** | `string` | _Optional_ | The role that will be considered as admin.
**`adminGroup`** | `string` | _Optional_ | The group that will be considered as admin.
**`scope`** | `string` | Required | The scope(s) to request from the OIDC provider

**[⬆️ Back to Top](#configuring)**

## `appConfig.webSearch` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`disableWebSearch`** | `boolean` | _Optional_ | Web search is enabled by default, but can be disabled by setting this property to `true`. Defaults to `false`
**`searchEngine`** | `string` | _Optional_ | Set the key name for your search engine. Can also use a custom engine by setting this property to `custom`. See the [searching docs](./searching.md#setting-search-engine) for the full list of built-in keys. Defaults to `duckduckgo`
**`customSearchEngine`** | `string` | _Optional_ | You can also use a custom search engine, or your own self-hosted instance. This requires `searchEngine: custom` to be set. Then add the URL of your service, with GET query string included here
**`openingMethod`** | `string` | _Optional_ | Set your preferred opening method for search results: `newtab`, `sametab`, `workspace`. Defaults to `newtab`
**`searchBangs`** | `object` | _Optional_ | A key-value-pair set of custom search _bangs_ for redirecting query to a specific app or search engine. The key of each should be the bang you will type (typically starting with `/`, `!` or `:`), and value is the destination, either as a search engine key (e.g. `reddit`) or a URL with search parameters (e.g. `https://en.wikipedia.org/w/?search=`)
**`openUrlsDirectly`** | `boolean` | _Optional_ | If `true`, queries that look like URLs will be opened directly instead of searched. Defaults to `false`

**[⬆️ Back to Top](#configuring)**

## `appConfig.hideComponents` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`hideHeading`** | `boolean` | _Optional_ | If set to `true`, the page title & sub-title will not be visible. Defaults to `false`
**`hideNav`** | `boolean` | _Optional_ | If set to `true`, the navigation menu will not be visible. Defaults to `false`
**`hideSearch`** | `boolean` | _Optional_ | If set to `true`, the search bar will not be visible. Defaults to `false`
**`hideSettings`** | `boolean` | _Optional_ | If set to `true`, the settings menu will be initially collapsed. Defaults to `false`

**[⬆️ Back to Top](#configuring)**

## `section`

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`name`** | `string` | Required | The title for the section
**`icon`** | `string` | _Optional_ | An single icon to be displayed next to the title. See [`section.icon`](#sectionicon-and-sectionitemicon)
**`items`** | `array` | _Optional_ | An array of items to be displayed within the section. See [`item`](#sectionitem). Sections must include either 1 or more items, or 1 or more widgets.
**`widgets`** | `array` | _Optional_ | An array of widgets to be displayed within the section. See [`widget`](#sectionwidget-optional)
**`displayData`** | `object` | _Optional_ | Meta-data to optionally override display settings for a given section. See [`displayData`](#sectiondisplaydata-optional)

**[⬆️ Back to Top](#configuring)**

## `section.item`

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`title`** | `string` | Required | The text to display/ title of a given item. Max length `18`
**`description`** | `string` | _Optional_ | Additional info about an item, which is shown in the tooltip on hover, or visible on large tiles
**`url`** | `string` | _Optional_ | The URL / location of web address for when the item is clicked
**`icon`** | `string` | _Optional_ | The icon for a given item. Can be a font-awesome icon, favicon, remote URL or local URL. See [`item.icon`](#sectionicon-and-sectionitemicon)
**`target`** | `string` | _Optional_ | The opening method for when the item is clicked, either `newtab`, `sametab`, `modal`, `workspace`, `clipboard`, `top` or `parent`. Where `newtab` will open the link in a new tab, `sametab` will open it in the current tab, and `modal` will open a pop-up modal, `workspace` will open in the Workspace view and `clipboard` will copy the URL to system clipboard (but not launch app). Defaults to `newtab`
**`hotkey`** | `number` | _Optional_ | Give frequently opened applications a numeric hotkey, between `0 - 9`. You can then just press that key to launch that application.
**`tags`** | `string[]` | _Optional_ | A list of tags, which can be used for improved search
**`statusCheck`** | `boolean` | _Optional_ | When set to `true`, Dashy will ping the URL associated with the current service, and display its status as a dot next to the item. The value here will override `appConfig.statusCheck` so you can turn off or on checks for a given service. Defaults to `appConfig.statusCheck`, falls back to `false`
**`statusCheckUrl`** | `string` | _Optional_ | If you've enabled `statusCheck`, and want to use a different URL to what is defined under the item, then specify it here
**`statusCheckHeaders`** | `object` | _Optional_ | If you're endpoint requires any specific headers for the status checking, then define them here
**`statusCheckAllowInsecure`** | `boolean` | _Optional_ | By default, any request to insecure content will be blocked. Setting this option to `true` will disable the `rejectUnauthorized` option, enabling you to ping non-HTTPS services for the current item. Defaults to `false`
**`statusCheckAcceptCodes`** | `string` | _Optional_ | If your service's response code is anything other than 2xx, then you can opt to specify an alternative success code. E.g. if you expect your server to return 403, but still want the status indicator to be green, set this value to `403`
**`statusCheckMaxRedirects`** | `number` | _Optional_ | If your service redirects to another page, and you would like status checks to follow redirects, then specify the maximum number of redirects here. Defaults to `0` / will not follow redirects
**`pingCheckEnabled`** | `boolean` | _Optional_ | When set to `true`, Dashy will make a real ICMP ping to each of your hosts and display their status as a dot next to each item. The value here will override `appConfig.pingCheckEnabled` so you can turn off or on pings for a given host. Defaults to `appConfig.pingCheckEnabled`, falls back to `false`
**`pingCheckHost`** | `string` | _Optional_ | FQDN hostname or IPV4 address of the host to ping. If empty or not defined then it uses the item's url host and if it is also invalid then no ping is performed. Defaults to `undefined`
**`pingCheckInterval`** | `number` | _Optional_ | The number of seconds between checks. The value will override `appConfig.pingCheckInterval` so you can adjust the ping interval per host. Defaults to `appConfig.pingCheckInterval`, falls back to `0`
**`pingCheckCount`** | `number` | _Optional_ | The number of ping ICMP packets sent to the host per check. The value will override `appConfig.pingCheckCount` so you can decide to send a different number of ping ICMP packets per host. Defaults to `appConfig.pingCheckCount`, falls back to `0`
**`pingCheckTimeout`** | `number` | _Optional_ | The number of milliseconds to wait for a ping to complete. The value will override `appConfig.pingCheckTimeout` so you can adjust the timeout per host. Defaults to `appConfig.pingCheckTimeout`, falls back to `0`
**`color`** | `string` | _Optional_ | An optional color for the text and font-awesome icon to be displayed in. Note that this will override the current theme and so may not display well
**`rel`** | `string` | _Optional_ | The value of the `rel` attribute for the link. Useful for specifying the relationship between the target link/document and Dashy. Defaults to `noopener noreferrer`
**`backgroundColor`** | `string` | _Optional_ | An optional background fill color for the that given item. Again, this will override the current theme and so might not display well against the background
**`provider`** | `string` | _Optional_ | The name of the provider for a given service, useful for when including hosted apps. In some themes, this is visible under the item name
**`displayData`** | `object` | _Optional_ | Meta-data to optionally override display settings for a given item. See [`displayData`](#itemdisplaydata-optional)
**`subItems`** | `array` | _Optional_ | An optional list of nested sub-items, rendered as smaller icons within the parent. Each sub-item supports `title`, `url`, `icon`, `target`, `color` and `backgroundColor`

**[⬆️ Back to Top](#configuring)**

## `item.displayData` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`hideForUsers`** | `string[]` | _Optional_ | Current item will be visible to all users, except for those specified in this list
**`showForUsers`** | `string[]` | _Optional_ | Current item will be hidden from all users, except for those specified in this list
**`hideForGuests`** | `boolean` | _Optional_ | Current item will be visible for logged in users, but not for guests (see `appConfig.enableGuestAccess`). Defaults to `false`
**`hideForKeycloakUsers`** | `object`  | _Optional_ | Current item will be visible to all keycloak users, except for those configured via these groups and roles. See `hideForKeycloakUsers`
**`showForKeycloakUsers`** | `object`  | _Optional_ | Current item will be hidden from all keycloak users, except for those configured via these groups and roles. See `showForKeycloakUsers`
**`hideFromWorkspace`** | `boolean` | _Optional_ | Current item will be visible in the default view but not in the Workspace view sidebar. Defaults to `false`
**`hideFromHomepage`** | `boolean` | _Optional_ | If `true`, item is hidden from the home and minimal views until matched by a search. Still visible in workspace, edit mode and single-section view. Defaults to `false`

**[⬆️ Back to Top](#configuring)**

## `section.widgets` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`type`** | `string` | Required | The widget type. See [Widget Docs](/docs/widgets.md) for full list of supported widgets
**`options`** | `object` | _Optional_ | Some widgets accept either optional or required additional options. Again, see the [Widget Docs](/docs/widgets.md) for full list of options
**`updateInterval`** | `number` | _Optional_ | You can keep a widget constantly updated by specifying an update interval, in seconds. See [Continuous Updates Docs](/docs/widgets.md#continuous-updates) for more info
**`useProxy`** | `boolean` | _Optional_ | Some widgets make API requests to services that are not CORS-enabled. For these instances, you will need to route requests through a proxy, Dashy has a built in CORS-proxy, which you can use by setting this option to `true`. Defaults to `false`. See the [Proxying Requests Docs](/docs/widgets.md#proxying-requests) for more info
**`timeout`** | `number` | _Optional_ | Request timeout in milliseconds, defaults to ½ a second (`500`)
**`ignoreErrors`** | `boolean` | _Optional_ | Prevent an error message being displayed, if a network request or something else fails. Useful for false-positives
**`label`** | `string` | _Optional_ | Add custom label to a given widget. Useful for identification, if there are multiple of the same type of widget in a single section

**[⬆️ Back to Top](#configuring)**

## `section.displayData` _(optional)_

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`sortBy`** | `string` | _Optional_ | The sort order for items within the current section. By default items are displayed in the order in which they are listed in within the config. The following sort options are supported: `most-used` (most opened apps first), `last-used` (the most recently used apps), `alphabetical`, `reverse-alphabetical`, `random` and `default`
**`collapsed`** | `boolean` | _Optional_ | If true, the section will  be collapsed initially, and will need to be clicked to open. Useful for less regularly used, or very long sections. Defaults to `false`
**`cutToHeight`** | `boolean` | _Optional_ | By default, sections will fill available space. Set this option to true to match section height with content height
**`rows`** | `number` | _Optional_ | Height of the section, specified as the number of rows it should span vertically, e.g. `2`. Defaults to `1`. Max is `5`. Applies to the default `auto` layout; ignored by `masonry` (where heights follow content) and the flex-based `horizontal`/`vertical` layouts.
**`cols`** | `number` | _Optional_ | Width of the section, specified as the number of columns the section should span horizontally, e.g. `2`. Defaults to `1`. Max is `5`. Will be clamped to the page's active column count so that a section never exceeds the available grid width.
**`itemSize`** | `string` | _Optional_ | Specify the size for items within this group, either `small`, `medium` or `large`. Note that this will override any settings specified through the UI
**`color`** | `string` | _Optional_ | A custom accent color for the section, as a hex code or HTML color (e.g. `#fff`)
**`customStyles`** | `string` | _Optional_ | Custom CSS properties that should be applied to that section, e.g. `border: 2px dashed #ff0000;`
**`sectionLayout`** | `string` | _Optional_ | Specify which CSS layout will be used to responsively place items. Can be either `auto` (which uses flex layout), or `grid`. Defaults to `auto`. Setting `itemCountX` or `itemCountY` below will also switch the section to grid layout automatically
**`itemCountX`** | `number` | _Optional_ | Number of items per row / horizontally. If not set, it will be calculated automatically based on available space. Setting this switches the section to grid layout. Must be a whole number between `1` and `12`; values above `8` rely on the grid's responsive column sizing (no explicit minimum-width rule)
**`itemCountY`** | `number` | _Optional_ | Number of explicit rows before items flow into implicit rows. Setting this switches the section to grid layout. Must be a whole number between `1` and `12`. Row heights size to their content (section heights follow content in the masonry layout)
**`hideForUsers`** | `string[]` | _Optional_ | Current section will be visible to all users, except for those specified in this list
**`showForUsers`** | `string[]` | _Optional_ | Current section will be hidden from all users, except for those specified in this list
**`hideForGuests`** | `boolean` | _Optional_ | Current section will be visible for logged in users, but not for guests (see `appConfig.enableGuestAccess`). Defaults to `false`
**`hideForKeycloakUsers`** | `object`  | _Optional_ | Current section will be visible to all keycloak users, except for those configured via these groups and roles. See `hideForKeycloakUsers`
**`showForKeycloakUsers`** | `object`  | _Optional_ | Current section will be hidden from all keycloak users, except for those configured via these groups and roles. See `showForKeycloakUsers`
**`hideFromWorkspace`** | `boolean` | _Optional_ | Current section will be visible in the default view but not in the Workspace view sidebar. Defaults to `false`

**[⬆️ Back to Top](#configuring)**

## `section.icon` and `section.item.icon`

**Field** | **Type** | **Required**| **Description**
--- | --- | --- | ---
**`icon`** | `string` | _Optional_ | The icon for a given item or section. <br>See [Icon Docs](/docs/icons.md) for all available supported icon types, including: auto-fetched favicons, generative icons, emoji icons, home-lab service logos, font-awesome, simple-icons, material icons, selfh.st icons, and icons specified by URL

**[⬆️ Back to Top](#configuring)**

## `section.displayData.hideForKeycloakUsers`, `section.displayData.showForKeycloakUsers`, `item.displayData.hideForKeycloakUsers` and `item.displayData.showForKeycloakUsers`

**Field** | **Type**   | **Required**| **Description**
--- |------------| --- | ---
**`groups`** | `string[]` | _Optional_ | Current Section or Item will be hidden or shown based on the user having any of the groups in this list
**`roles`** | `string[]` | _Optional_ | Current Section or Item will be hidden or shown based on the user having any of the roles in this list

**[⬆️ Back to Top](#configuring)**

---

## Notes

### Editing Config through the UI

Config can be modified directly through the UI, and then written to disk, or applied locally. This can be done wither with the raw config editor (introduced in V 0.6.5 / [#3](https://github.com/Lissy93/dashy/pull/3)), or the interactive editor (introduced in V 1.8.9 / [#298](https://github.com/Lissy93/dashy/pull/298)).

<p align="center">
  <a href="https://ibb.co/CzkyMNb">
    <b>Interactive Editor</b><br>
    <img alt="Interactive Editor demo" src="https://user-images.githubusercontent.com/1862727/139543020-b0576d28-0830-476f-afc8-a815d4de6def.gif" width="600" />
  </a>
  <br>
  <a href="https://ibb.co/zRv542H">
  <b>JSON Editor</b><br>
  <img alt="Config Editor demo" src="https://raw.githubusercontent.com/Lissy93/dashy/master/docs/assets/config-editor-demo.gif" width="600" />
  </a>
</p>

### About YAML

If you're new to YAML, it's pretty straight-forward. The format is exactly the same as that of JSON, but instead of using curly braces, structure is denoted using whitespace. This [quick guide](https://linuxhandbook.com/yaml-basics/) should get you up to speed in a few minutes, for more advanced topics take a look at this [Wikipedia article](https://en.wikipedia.org/wiki/YAML).

### Config Saving Methods

When updating the config through the JSON editor in the UI, you have two save options: **Local** or **Write to Disk**.

- Changes saved locally will only be applied to the current user through the browser, and will not apply to other instances - you either need to use the cloud sync feature, or manually update the conf.yml file.
- On the other-hand, if you choose to write changes to disk, then your main `conf.yml` file will be updated, and changes will be applied to all users, and visible across all devices. For this functionality to work, you must be running Dashy with using the Docker container, or the Node server.  A backup of your current configuration will also be saved in the same directory.

### Preventing Changes

If you have authentication set up, then any user who is not an admin (with `type: admin`) will not be able to write changes to disk.

You can also prevent changes from any user being written to disk, using `preventWriteToDisk`. Or prevent any changes from being saved locally in browser storage, using `preventLocalSave`.

To disable all UI config features, set `disableConfiguration`. Alternatively you can disable UI config features for all non Admin users by setting `disableConfigurationForNonAdmin` to true.

### Example

```yaml
---
pageInfo:
  title: Home Lab
sections: # An array of sections
- name: Section 1 - Getting Started
  items: # An array of items
  - title: GitHub
    description: Source code and documentation on GitHub
    icon: fab fa-github
    url: https://github.com/Lissy93/dashy
  - title: Issues
    description: View currently open issues, or raise a new one
    icon: fas fa-bug
    url: https://github.com/Lissy93/dashy/issues
  - title: Demo
    description: A live demo
    icon: far fa-rocket
    url: https://dashy-demo-1.netlify.app
- name: Section 2 - Local Services
  items:
  - title: Firewall
    icon: favicon
    url: http://192.168.1.1/
  - title: Game Server
    icon: https://i.ibb.co/710B3Yc/space-invader-x256.png
    url: http://192.168.130.1/
```

For more example config files, see: [this gist](https://gist.github.com/Lissy93/000f712a5ce98f212817d20bc16bab10)

If you need any help, feel free to [Raise an Issue](https://github.com/Lissy93/dashy/issues/new?assignees=Lissy93&labels=%F0%9F%A4%B7%E2%80%8D%E2%99%82%EF%B8%8F+Question&template=question.md&title=%5BQUESTION%5D) or [Start a Discussion](https://github.com/Lissy93/dashy/discussions)

Happy Configuring 🤓🔧

**[⬆️ Back to Top](#configuring)**
