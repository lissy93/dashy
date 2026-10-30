# Icons

Both sections and items can have an icon, which is specified using the `icon` attribute. Using icons improves the aesthetics of your UI and makes the app more intuitive to use. Dashy supports multiple different icon providers, usage instructions for which are explained here.

- [Auto-Fetched Favicons](#favicons)
- [Font Awesome Icons](#font-awesome)
- [Simple Icons](#simple-icons)
- [Generative Icons](#generative-icons)
- [Emoji Icons](#emoji-icons)
- [selfh.st Icons](#selfhst-icons)
- [Home-Lab Icons](#home-lab-icons)
- [Material Icons](#material-design-icons)
- [Icons by URL](#icons-by-url)
- [Local Icons](#local-icons)
- [Using a Default Icon](#default-icon)
- [No Icon](#no-icon)
- [Icon Color](#icon-color)

  <img width="500" src="https://i.ibb.co/GTVmZnc/dashy-example-icons.png" />

---

## Favicons

Dashy can auto-fetch an icon for a given service, using it's favicon. Just set `icon: favicon` to use this feature.

  <img width="580" src="https://i.ibb.co/k6wyhnB/favicon-icons.png" />

Since different websites host their favicons at different paths, for the best results Dashy can use an API to resolve a websites icon.

The default favicon API is  [allesedv.com](https://favicon.allesedv.com/), but you can change this under `appConfig.faviconApi`. If you'd prefer not to use an API, just set this value to `local`. You can also use different APIs for individual items, by setting `icon: favicon-[api]`, e.g. `favicon-iconhorse`.

The following favicon APIs are supported:

- `allesedv` - [allesedv.com](https://favicon.allesedv.com/) is a highly efficient IPv6-enabled service
- `iconhorse` - [Icon.Horse](https://icon.horse/) returns quality icons for any site, with caching for speed and fallbacks for sites without an icon
- `faviconkit` - [faviconkit.com](https://faviconkit.com/) good quality icons and most sites supported (Note: down as of Nov '21)
- `besticon` - [BestIcon](https://github.com/mat/besticon) fetches websites icons from manifest
- `mcapi` - [MC-API](https://eu.mc-api.net/) fetches default website favicon, originally a Minecraft util
- `duckduckgo` - Returns decent quality website icons, from DuckDuckGo search
- `google` - Official Google favicon API service, good support for all sites, but poor quality
- `yandex` - Lower quality icons, but useful in some regions where other services are blocked
- `webmasterapi` - [WebMasterAPI](https://www.webmasterapi.com/) fetches website favicons via their API
- `local` - Set to local to fetch the default icon at /favicon.ico instead of using an API

If for a given service none of the APIs work in your situation, and nor does local, then the best option is to find the path of the services logo or favicon, and set the icon to the URL of the raw image. For example, `icon: https://monitoring.local/faviconx128.png`- you can find this path using the browser dev tools.

---

## Font Awesome

You can use any [Font Awesome Icon](https://fontawesome.com/icons) simply by specifying it's identifier. This is in the format of `[category] [name]` and can be found on the page for that icon on the Font Awesome site. For example: `fas fa-rocket`, `fab fa-monero` or `fas fa-unicorn`.

Font-Awesome has a wide variety of free icons, but you can also use their pro icons if you have a membership. To do so, you need to specify your license key under: `appConfig.fontAwesomeKey`. This is usually a 10-digit string, for example `13014ae648`.

  <img width="500" src="https://i.ibb.co/tMtwNYZ/fontawesome-icons3.png" />

---

## Simple Icons

[SimpleIcons.org](https://simpleicons.org/) is a collection of 2000+ high quality, free and open source brand and logo SVG icons. Usage of which is very similar to font-awesome icons. First find the glyph you want to use on the [website](https://simpleicons.org/), then just set your icon to the simple icon slug, prefixed with `si-`.

  <img width="580" src="https://i.ibb.co/MVhkXfC/simple-icons-example.png" />

For example:

```yaml
sections:
- name: Simple Icons Example
  items:
  - title: Portainer
    icon: si-portainer
  - title: FreeNAS
    icon: si-freenas
  - title: NextCloud
    icon: si-nextcloud
  - title: Home Assistant
    icon: si-homeassistant
```

---

## Generative Icons

To uses a unique and programmatically generated icon for a given service just set `icon: generative`. This is particularly useful when you have a lot of similar services with a different IP or port, and no specific icon. These icons are generated with [DiceBear](https://api.dicebear.com/) (or [Evatar](https://evatar.io/) for fallback), and use a hash of the services domain/ ip for entropy, so each domain will have a unique icon.

  <img width="500" src="https://i.ibb.co/b2pC2CL/generative-icons-2.png" />

---

## Emoji Icons

You can use almost any emoji as an icon for items or sections. You can specify the emoji either by pasting it directly, using it's unicode ( e.g. `'U+1F680'`) or shortcode (e.g. `':rocket:'`). You can find these codes for any emoji using [Emojipedia](https://emojipedia.org/) (near the bottom of emoji each page), or for a quick reference to emoji shortcodes, check out [emojis.ninja](https://emojis.ninja/) by @nomanoff.

  <img width="580" src="https://i.ibb.co/YLwgTf9/emoji-icons-1.png" />

For example, these will all render the same rocket (🚀) emoji: `icon: ':rocket:'` or `icon: 'U+1F680'` or `icon: 🚀`

---

## selfh.st Icons

The [selfh.st](https://selfh.st/) project provides a set of icons, originally for self-hosted services, but now expanded to include a wide variety of services. These icons can be used by specifying the icon name (without extension and with all spaces replaced with -) preceded by `sh-`. See https://selfh.st/icons/ for a full list of all available icons. For example, the Home Assistant icon is `sh-home-assistant`.

Note: These icons are fetched from the jsdelivr CDN, so if you require offline access, the [Local Icons](#local-icons) method may be a better option for you.

  <img width="580" src="https://i.ibb.co/pfy09LH/Screenshot-from-2025-01-08-22-04-21.png" />

---

## Home-Lab Icons

The [dashboard-icons](https://github.com/homarr-labs/dashboard-icons) repo by [Homarr Labs](https://github.com/homarr-labs) provides a comprehensive collection of high-quality icons for commonly self-hosted services. Dashy natively supports these icons, and you can use them just by specifying the icon name (without extension) preceded by `hl-`. SVG is preferred where available, with an automatic fallback to PNG for icons that aren't published as SVG. See [here](https://github.com/homarr-labs/dashboard-icons/tree/main/svg) for a full list of all available icons. Note that these are fetched and cached straight from jsDelivr, so if you require offline access, the [Local Icons](#local-icons) method may be a better option for you.

For example:

```yaml
sections:
- name: Home Lab Icons Example
  items:
  - title: AdGuard Home
    icon: hl-adguardhome
  - title: Long Horn
    icon: hl-longhorn
  - title: Nagios
    icon: hl-nagios
  - title: Whoogle Search
    icon: hl-whooglesearch
```

  <img width="580" src="https://i.ibb.co/PQzYHmD/homelab-icons-2.png" />

---

## Material Design Icons

Dashy also supports 5000+ [material-design-icons](https://github.com/Templarian/MaterialDesign). To use these, first find the name/ slug for your icon [here](https://dev.materialdesignicons.com/icons), and then prefix is with `mdi-`.

For example:

```yaml
sections:
- name: Material Design Icons Example
  items:
  - title: Alien Icon
    icon: mdi-alien
  - title: Fire Icon
    icon: mdi-fire
  - title: Dino Icon
    icon: mdi-google-downasaur
```

  <img width="500" src="https://i.ibb.co/fC9B4mq/icons-mdi-example.png" />

---

## Icons by URL

You can also set an icon by passing in a valid URL pointing to the icons location. For example `icon: https://i.ibb.co/710B3Yc/space-invader-x256.png`, this can be in .png, .jpg or .svg format, and hosted anywhere (local or remote) - so long as it's accessible from where you are hosting Dashy. The icon will be automatically scaled to fit, however loading in a lot of large icons may have a negative impact on performance, especially if you visit Dashy from new devices often.

---

## Local Icons

You may also want to store your icons locally, bundled within Dashy so that there is no reliance on outside services. This can be done by putting the icons within Dashy's `./user-data/item-icons/` directory. If you are using Docker, then the easiest option is to map a volume from your host system, for example: `-v /local/image/directory:/app/user-data/item-icons/`. To reference an icon stored locally, just specify it's name and extension. For example, if my icon was stored in `/app/user-data/item-icons/maltrail.png`, then I would just set `icon: maltrail.png`.

You can also use sub-folders within the `item-icons` directory to keep things organized. You would then specify an icon with it's folder name slash image name. For example: `networking/monit.png`

---

## Default Icon

If you'd like to set a default icon, to be applied to any items which don't have an icon already set, then this can be done under `appConfig.defaultIcon`.

---

## No Icon

If you don't wish for a given item or section to have an icon, just leave out the `icon` attribute.

---

## Icon Color

Font Awesome, Simple Icons and Material Design icons take on the item's `color`. To color just the icon, set `iconColor` to a hex code or color name:

```yaml
- title: GitHub
  icon: si-github
  iconColor: '#ffa500'
```

---

## Icon Collections and Resources

The following websites provide good-quality, free icon sets. To use any of these icons, either copy the link to the raw icon (it should end in `.svg` or `.png`) and paste it as your `icon`, or download and save the icons in `/user-data/item-icons` / mapped Docker volume. Full credit to the authors, please see the licenses for each service for usage and copyright information.

- [Icons for Self-Hosted Apps](https://thehomelab.wiki/books/helpful-tools-resources/page/icons-for-self-hosted-dashboards) - 350+ high-quality icons for commonly self-hosted services
- [SVG Box](https://svgbox.net/iconsets/) - Cryptocurrency, social media apps and flag icons
- [Simple Icons](https://simpleicons.org/) - Free SVG brand icons, with easy API access
- [Material Design Icons](https://github.com/google/material-design-icons/) - Hundreds of Open source PNG + SVG icons by Google
- [Icons8](https://icons8.com/icons) - Thousands of icons, all with free versions at 64x64
- [Flat Icon](https://www.flaticon.com/) - Wide variety of icon sets, most of which are free to use
- [SVG Repo](https://www.svgrepo.com/) - 300,000+ Vector Icons

If you are a student, then you can get free access to premium icons on [Icon Scout](https://education.github.com/pack/redeem/iconscout-student) or [Icons8](https://icons8.com/github-students) using the [GitHub Student Pack](https://education.github.com/pack).

---

## Notes

If you are using icons from an external source, these will be fetched on initial page load automatically, if and when needed. But combining icons from multiple services may have a negative impact on performance.

You can improve load speeds, by  downloading your required icons, and serving them locally. Scaling icons to the minimum required dimensions (e.g. 128x128 or 64x64) will also greatly improve application load times.

For icons from external sources, please see the Privacy Policies and Licenses for that provider.
