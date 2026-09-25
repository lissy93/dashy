# Search & Shortcuts

## Searching

One of the primary purposes of Dashy is to allow you to quickly find and launch a given app. To make this as quick as possible, there is no need to touch the mouse, or press a certain key to begin searching - just start typing. Results will be filtered in real-time. No need to worry about case, special characters or small typos, these are taken care of, and your results should appear.

## Navigating

You can navigate through your items or search results using the keyboard. You can use <kbd>Tab</kbd> to cycle through results, and <kbd>Shift</kbd> + <kbd>Tab</kbd> to go backwards. Or use the arrow keys, <kbd>↑</kbd>, <kbd>→</kbd>, <kbd>↓</kbd> and <kbd>←</kbd>.

## Launching Apps

You can launch a elected app by hitting <kbd>Enter</kbd>. This will open the app using your default opening method, specified in `target` (one of `newtab`, `sametab`, `parent`, `top`, `modal`, `workspace`, `clipboard` or `newwindow`). You can also use <kbd>Alt</kbd> + <kbd>Enter</kbd> to open the app in a pop-up modal, or <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to open it in a new tab. For all available opening methods, just right-click on an item, to bring up the context menu.

## Tags

By default, when searching items are filtered by the `title`, (as well as the `url`, `provider`, `description` and `alias`). If you need to find results based on text which isn't included in these attributes, then you can add `tags` to a given item.

```yaml
  items:
  - title: Plex
    description: Media library
    icon: favicon
    url: https://plex.lab.local
    tags: [ movies, videos, music ]
  - title: FreshRSS
    description: RSS Reader
    icon: favicon
    url: https://freshrss.lab.local
    tags: [ news, updates, blogs ]

```

In the above example, Plex will be visible when searching for 'movies', and FreshRSS with 'news'

## Hiding Items From The Homepage

You can hide a rarely-used item from the main view but still have it surface when you search for it. Set `displayData.hideFromHomepage: true` on the item.

```yaml
- title: MXToolbox
  url: https://mxtoolbox.com
  tags: [dns, mail, debug]
  displayData:
    hideFromHomepage: true
```

The item still shows up in search results, and stays visible in the workspace view, in edit mode, and when you navigate into its parent section directly.

## Custom Hotkeys

For apps that you use regularly, you can set a custom keybinding. Use the `hotkey` parameter on a certain item to specify a numeric key, between `0 - 9`. You can then launch that app, by just pressing that key, which is much quicker than searching for it, if it's an app you use frequently.

```yaml
- title: Bookstack
  icon: far fa-books
  url: https://bookstack.lab.local/
  hotkey: 2
- title: Git Tea
  icon: fab fa-git
  url: https://git.lab.local/
  target: workspace
  hotkey: 3
```

In the above example, pressing <kbd>2</kbd> will launch Bookstack. Or hitting <kbd>3</kbd> will open Git in the workspace view.

## URL Aliases

Set an `alias` on an item, and visiting that word as a path on your dashboard will redirect you straight to the item's URL. This lets you jump to an app by typing `dashy/jelly` into the address bar, without loading the dashboard first.

```yaml
- title: Jellyfin
  icon: sh-jellyfin
  url: https://jellyfin.lab.local
  alias: jelly
```

Above, visiting `https://dashy.lab.local/jelly` sends you to Jellyfin. Matching ignores case, and an alias which doesn't match any item shows the 404 page. Aliases are also searchable, so typing `jelly` into Dashy's search will surface Jellyfin.

Some limitations to be aware of:
- Aliases must be lowercase, may only contain letters, numbers, hyphens and underscores
- Only items in your main config file are reachable - items on [multi-page](/docs/pages-and-sections) sub-pages are not
- Only `http://` and `https://` item URLs can be redirected to
- Items hidden from the current user (via `displayData`) are not reachable by their alias (you need to login to a user with access first)
- Requires history routing (the default). Under `VITE_APP_ROUTING_MODE=hash` the URL would need to be `dashy/#/jelly`
- It's not possible to create aliases for pages Dashy already uses, including: 'home', 'minimal', 'workspace', 'login', 'download' and '404'
- If two items share an alias, the first one in the config wins

## Searching From The Address Bar

Dashy publishes an [OpenSearch](https://developer.mozilla.org/en-US/docs/Web/XML/Guides/OpenSearch) descriptor (at `/opensearch.xml`), so your browser can offer it as a search keyword. Once added, typing `dashy jelly` into the address bar jumps straight to Jellyfin if you've setup an `alias` for this.

Most browsers pick this up after you've visited your dashboard, then need the keyword assigning by hand:
- **Chrome / Edge**: Settings → Search engines → Site search, find your dashboard and set a shortcut
- **Firefox**: Settings → Search → Search Shortcuts, or right-click the address bar and choose "Add search engine"

You can also skip OpenSearch and add the engine manually, using `https://dashy.lab.local/%s` as the URL.

## Web Search

It's possible to launch a web search directly from Dashy, which might be useful if you're using Dashy as your start page. This can be done by typing your query as normal, and then pressing <kbd>⏎</kbd>/Enter. Web search options are configured under `appConfig.webSearch`.

### Setting Search Engine

Set your default search engine using the `webSearch.searchEngine` property. This defaults to DuckDuckGo. Search engine must be referenced by their key, the following providers are supported:

- [`duckduckgo`](https://duckduckgo.com), [`google`](https://google.com), [`brave`](https://search.brave.com), [`kagi`](https://kagi.com), [`qwant`](https://www.qwant.com), [`startpage`](https://www.startpage.com)
- [`perplexity`](https://www.perplexity.ai), [`uruky`](https://uruky.com), [`searx-tiekoetter`](https://searx.tiekoetter.com), [`ecosia`](https://www.ecosia.org), [`metager`](https://metager.org/meta), [`swisscows`](https://swisscows.com), [`mojeek`](https://www.mojeek.com), [`peekier`](https://peekier.com)
- [`wikipedia`](https://en.wikipedia.org), [`wolframalpha`](https://www.wolframalpha.com), [`stackoverflow`](https://stackoverflow.com), [`github`](https://github.com), [`reddit`](https://www.reddit.com), [`youtube`](https://youtube.com), [`bbc`](https://www.bbc.co.uk)

### Using Custom Search Engine

You can also use a custom search engine, that isn't included in the above list (like a self-hosted instance of [Whoogle](https://github.com/benbusby/whoogle-search) or [Searx](https://searx.github.io/searx/)). Set `searchEngine: custom`, and then specify the URL (plus query params) to you're search engine under `customSearchEngine`.

For example:

```yaml
appConfig:
  webSearch:
    searchEngine: custom
    customSearchEngine: 'https://searx.local/search?q='
```

### Setting Opening Method

In a similar way to opening apps, you can specify where you would like search results to be opened. This is done under the `openingMethod` attribute, and can be set to either  `newtab`, `sametab` or `workspace`. By default results are opened in a new tab.

### Using Bangs

An insanely useful feature of DDG is [Bangs](https://duckduckgo.com/bang), where you type a specific character combination as part of your search query, and it will be redirected the that website, such as '!w Docker' will display the Docker wikipedia page. Dashy has a similar feature, enabling you to define your own custom bangs to redirect search results to a specific app, website or search engine. The bang can appear anywhere in the query. As long as the whole token is present, pressing Enter will launch that search bang

This is configured under the `searchBangs` property, with a list of key value pairs. The key is what you will type, and the value is the destination, either as an identifier or a URL with query parameters.

For example:

```yaml
appConfig:
  webSearch:
    searchEngine: 'duckduckgo'
    openingMethod: 'newtab'
    searchBangs:
      /r: reddit
      /w: wikipedia
      /s: https://whoogle.local/search?q=
      /a: https://www.amazon.co.uk/s?k=
      ':wolf': wolframalpha
      ':so': stackoverflow
      ':git': github
```

In the above example, when you type `:so how to exit vim` you'll be automatically sent to StackOverflow

Note that bangs begging with `!` or `:` must be surrounded in quotes in the config (to keep it valid YAML)

### Disabling Web Search

Web search can be disabled, by setting `disableWebSearch`, for example:

```yaml
appConfig:
  webSearch: { disableWebSearch: true }
```

When web search is disabled, pressing <kbd>Enter</kbd> opens the first matching item instead of web search. This will use that item's configured opening method

### Opening URLs Directly

When enabled (with `appConfig.webSearch.openUrlsDirectly`), if your search query looks like a URL, pressing <kbd>Enter</kbd> will navigate directly to that URL instead of searching for it. Recognized formats include:

- Full URLs with scheme: `https://example.org/path`
- Dotted hostnames: `github.com`, `example.com:8080`, `example.com/path`
- IP addresses: `192.168.1.1`, `192.168.1.1:8080`, `192.168.1.1/admin`
- `localhost` (with optional port and/or path): `localhost`, `localhost:8080`
- Bare hostnames when followed by a port or path: `nas:8080`, `router/setup`

Note that a bare ambiguous word on its own (e.g. `nas`, `kubernetes`) is still treated as a search query, since the intent isn't clear.

Set `appConfig.webSearch.openUrlsDirectly` to `true`:

```yaml
appConfig:
  webSearch:
    openUrlsDirectly: true
```

## Clearing Search

You can clear your search term at any time, resting the UI to it's initial state, by pressing <kbd>Esc</kbd>.
This can also be used to close any open pop-up modals.
