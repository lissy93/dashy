# Pages and Sections

## Page Metadata

Set your dashboard's branding under `pageInfo`

```yaml
pageInfo:
  title: My Dashboard # Used for main h1 title, and browser tab text
  description: Home server links
  logo: /web-icons/my-logo.png # path/URL to optional logo to display next to title
  favicon: 'https://example.com/path/to/icon' # path/URL to a favicon (shows in browser tab)
  color: '#2a7cf0' # Hex color, to set the browser/address bar color on mobile (supported browsers only)
  footer: '© 2026 Me' # Optional text or HTML content, to display in the pages footer
```

If you have multiple configs/pages, then these values swap automatically as you navigate between sub-pages.

The only caveat being, if you install Dashy as a PWA, the installed app's name, icon, and splash-screen colour come from the bundled `manifest.webmanifest` (baked at build time) rather than `pageInfo`. Runtime values only apply when browsing in a regular tab or browser.

---

## Multi-Page Support

You can have additional pages within your dashboard, with each having its own config file. The config files for sub-pages can either be stored locally, or hosted separately. A link to each additional page will be displayed in the navigation bar.

You can edit additional pages using the interactive editor, exactly the same way as your primary page (so long as it's local). If you switch pages while editing, you'll be asked to confirm, and any unsaved changes will be discarded.

### Using Local Sub-Pages

To get started, create a new `.yml` config file for your sub-page, placing it within `/app/user-data`. Then within your primary `conf.yml`, choose a name, and specify the path to the new file.

For example, add this at the top level of your `conf.yml` (not nested under `appConfig` or `sections`):

```yaml
pages:
- name: Networking Services
  path: 'networking.yml'
- name: Work Stuff
  path: 'work.yml'
```

The next step is to create the new page, if you mounted `/app/user-data` in the docker command and not a volume, you can simply create the new page into that folder on the host.

If you mounted `/app/user-data/conf.yml` in docker, you can either switch to the volume or create another bind mount to your new additional page.

Sub-page files need to be directly within `/app/user-data` (not in a subfolder), and you only need to specify the filename. For a config stored anywhere else, use a URL instead (see [Remote Sub-Pages](#using-remote-sub-pages)).

A default template for a page can be found here: [https://github.com/lissy93/dashy/blob/master/user-data/conf.yml](https://github.com/lissy93/dashy/blob/master/user-data/conf.yml)

Now if you reload the page, on the top right there should be a new button to navigate to the new page. 🎉

### Using Remote Sub-Pages

Config files don't need to be local, you can store them anywhere, and data will be imported as sub-pages on page load.

For example:

```yaml
pages:
- name: Getting Started
  path: 'https://snippet.host/tvcw/raw'
- name: Homelab
  path: 'https://snippet.host/tetp/raw'
- name: Browser Startpage
  path: 'https://snippet.host/zcom/raw'
```

There are many options of how this can be used. You could store your config within a Git repository, in order to easily track and rollback changes. Or host your config on your NAS, to have it backed up with the rest of your files. Or use a hosted paste service, for example [snippet.host](https://snippet.host/), which supports never-expiring CORS-enabled pastes, which can also be edited later.

You will obviously not be able to write updates to remote configs directly through the UI editor, but you can still make and preview changes, then use the export menu to get a copy of the new config, which can then be pasted to the remote source manually.
The config file must, of course, be accessible from within Dashy. If your config contains sensitive info (like API keys, credentials, secret URLs, etc), take care not to expose it to the internet.

The following example shows creating a config, publishing it as a [Gist](https://gist.github.com/), copying the URL to the raw file, and using it within your dashboard.

  <img width="700" alt="Public config in a gist demo"
    src="https://i.ibb.co/55jm3LG/how-to-use-remote-config-sub-page.gif"
  />

### Restrictions

Sub-pages support the top-level `pageInfo`, `sections` and `appConfig` fields. A sub-page's `appConfig` is merged over your main one, so you only need the settings you want to change, like `theme` or `layout`. `appConfig.auth` and `pages` always come from your main `conf.yml` file. Other than that, sub-pages behave exactly the same as your default view, and can contain sections, items, widgets and page info like nav links, title and logo.

### URL Structure

Every view in Dashy shares the same URL shape, so any config can be reached from any view:

```
/                             Landing — whichever view you set as the default
/<view>                       Root config in <view>
/<view>/<page>                Sub-config <page> in <view>
/<view>/<page>/<section>      Single section of <page> in <view>
/<view>/main/<section>        Single section of the root config (main is a reserved page id)
```

`<view>` is one of `home`, `minimal`, or `workspace`. `<page>` is the sub-config id — the sub-page's `name` (from the `pages` array) converted to lowercase-and-dashes (emoji and other non-word characters stripped). `<section>` follows the same slugging rules. Workspace has no single-section URL; it uses its sidebar instead.

Examples:

```
/home                         Home view, main config
/home/homelab                 Home view, "Homelab" sub-config
/home/homelab/media           Home view, "Homelab" sub-config, "Media" section only
/home/main/getting-started    Home view, main config, "Getting Started" section only
/minimal/homelab              Minimal view, "Homelab" sub-config
/minimal/homelab/media        Minimal view, "Homelab" sub-config, "Media" section pre-selected
/workspace/homelab            Workspace view, "Homelab" sub-config
```

The view switcher, sub-page nav links, and section deep-links all preserve your current view and sub-page — so clicking through a single-section view and then hitting "back to all" returns you to the same sub-page you came from.

---

## Layout

`appConfig.layout` controls how your sections sit on the page:

- `auto` (default): responsive CSS grid, sections size by `displayData.cols`/`rows`
- `horizontal`: sections stacked top to bottom, each full width
- `vertical`: sections side by side in columns
- `masonry`: responsive grid where heights follow content so shorter sections fill gaps under taller ones (`rows` is ignored)

You can also switch between these from the settings menu. Add `appConfig.colCount` to force a specific number of columns.

### Making a section wider or taller

Use `displayData.cols` (1 to 5) and `displayData.rows` (1 to 5) to control a section's footprint:

```yaml
- name: Important Links
  displayData:
    cols: 2
    rows: 2
    collapsed: false
  items: [...]
```

`rows` is honoured by the `auto` layout. Under `masonry`, section heights always follow content.

### Items inside a section

Items wrap responsively by default. The useful knobs on `displayData`:

- `itemSize`: `small`, `medium` (default), or `large` (large tiles also show a description)
- `sortBy`: `alphabetical`, `reverse-alphabetical`, `most-used`, `last-used`, `random`
- `sectionLayout: grid` plus `itemCountX` and/or `itemCountY` if you want a fixed grid instead of auto wrapping

See [configuring.md](/docs/configuring#sectiondisplaydata-optional) for the full list of options.

### Sub-Items

A normal section will contain zero or more items, for example:

```yaml
- name: Coding
  icon: far fa-code
  items:
  - title: GitHub
    url: https://github.com/
  - title: StackOverflow
    url: http://stackoverflow.com/
```

But items can also be grouped together, referred to as sub-items. This is useful for a group of less frequently used items, which you don't want to take up too much space.

Item groups may also have an optional title.

```yaml
- name: Coding
  icon: far fa-code
  items:
  - title: Normal Item 1
  - title: Normal Item 2
  - title: Languages
    subItems:
    - title: JavaScript
      url: https://developer.mozilla.org
      icon: si-javascript
    - title: TypeScript
      url: https://www.typescriptlang.org/docs
      icon: si-typescript
    - title: Svelte
      url: https://svelte.dev/docs
      icon: si-svelte
    - title: Go
      url: https://go.dev/doc
      icon: si-go
```
