# Troubleshooting

> _**This document contains common problems and their solutions.**_<br />
> Please ensure your issue isn't listed here, before opening a new ticket.
>
> _Found something not listed here? Consider adding it, to help other users._

## Contents

- [Config not loading](#config-not-loading)
  - [You see the default dashboard instead of yours](#you-see-the-default-dashboard-instead-of-yours)
  - [Failed to fetch configuration, status 404](#failed-to-fetch-configuration-server-responded-with-status-404)
  - [Config came back after a permissions fix, but auth is ignored](#config-came-back-after-a-permissions-fix-but-auth-is-ignored)
  - [Edits on the host never reach the container](#edits-on-the-host-never-reach-the-container)
  - [Your browser shows an old config](#your-browser-shows-an-old-config)
  - [Empty dashboard with "Login" in the title](#empty-dashboard-with-login-in-the-title)
  - [Static hosting ignores config changes](#static-hosting-ignores-config-changes)
  - [Nothing loads when Dashy is behind a sub-path](#nothing-loads-when-dashy-is-behind-a-sub-path)
- [Config not saving](#config-not-saving)
  - [Permission denied or read-only filesystem](#permission-denied-or-read-only-filesystem-eacces-erofs)
  - [Kubernetes ConfigMap mount is read-only](#kubernetes-configmap-mount-is-read-only)
  - [SELinux or AppArmor blocks the write](#selinux-or-apparmor-blocks-the-write)
  - [Backup step fails so save aborts](#backup-step-fails-so-save-aborts)
  - [Save button is missing or returns 403](#save-button-is-missing-or-returns-403-forbidden)
  - [Save unavailable on Vercel, Netlify or other static hosts](#save-unavailable-on-vercel-netlify-or-other-static-hosts)
  - [/config-manager/save returns 404 or HTML](#config-managersave-returns-404-or-html)
  - ["Invalid filename" when saving a sub-page](#invalid-filename-when-saving-a-sub-page)
  - ["Cannot save to an external URL"](#cannot-save-to-an-external-url)
  - [Saved successfully but the UI shows the old config](#saved-successfully-but-the-ui-shows-the-old-config)
  - [Container crashes or restart loop after saving](#container-crashes-or-restart-loop-after-saving-310-and-311-only)
  - [Intentionally read-only mode](#intentionally-read-only-mode)
- [Refused to Connect in Web Content View](#refused-to-connect-in-modal-or-workspace-view)
- [404 / Routing issues](#404--routing-issues)
  - [404 On Static Hosting](#404-on-static-hosting)
  - [404 from Mobile Home Screen](#404-after-launch-from-mobile-home-screen)
  - [404 On Multi-Page Apps](#404-on-multi-page-apps)
  - [Dashy hosted at a sub-path](#dashy-hosted-at-a-sub-path-eg-examplecomdashy)
- [Sub-pages](#sub-pages)
  - [Sub-page shows "Unable to find config for ..."](#sub-page-shows-unable-to-find-config-for)
  - [Sub-page missing from nav, or won't open when clicked](#sub-page-missing-from-nav-or-wont-open-when-clicked)
  - [Sub-page ignores its theme, layout or appConfig](#sub-page-ignores-its-theme-layout-or-appconfig)
  - [Sub-config files return 404](#sub-config-files-return-404)
  - [Remote Config Not Loading](#remote-config-not-loading)
- [Build & memory errors](#build--memory-errors)
  - [Yarn Build or Run Error](#yarn-error)
  - [The engine "node" is incompatible with this module](#the-engine-node-is-incompatible-with-this-module)
  - [`yarn build` fails inside the container](#yarn-build-fails-inside-the-container)
  - [High CPU or RAM Usage on Startup](#high-cpu-or-ram-usage-on-startup)
  - [Heap limit Allocation failed](#ineffective-mark-compacts-near-heap-limit-allocation-failed)
  - [Command failed with signal "SIGKILL"](#command-failed-with-signal-sigkill)
  - [Node Sass unsupported environment](#node-sass-does-not-yet-support-your-current-environment)
  - [Unreachable Code Error](#unreachable-code-error)
  - [Cannot find module './_baseValues'](#error-cannot-find-module-_basevalues)
- [Auth & OIDC](#auth--oidc)
  - [Auth Validation Error: "should be object"](#auth-validation-error-should-be-object)
  - [Keycloak Redirect Error](#keycloak-redirect-error)
  - [OIDC or Keycloak failure on numeric client IDs](#oidc-or-keycloak-failure-on-numeric-client-ids)
  - [Redirect loop after login](#redirect-loop-after-login)
  - [invalid_redirect_uri](#invalid_redirect_uri)
  - [Login works in the browser but the dashboard refuses to save anything (403)](#login-works-in-the-browser-but-the-dashboard-refuses-to-save-anything-403)
  - [Logged in but no admin controls](#logged-in-but-no-admin-controls)
  - [Login works but Dashy errors on the callback with "OIDC signinCallback returned no user"](#login-works-but-dashy-errors-on-the-callback-with-oidc-signincallback-returned-no-user)
  - [Sign-out leaves you stuck on Authentik](#sign-out-leaves-you-stuck-on-authentik)
  - [Untrusted certificate from Authentik](#untrusted-certificate-from-authentik)
  - [Numeric client_id getting truncated](#numeric-client_id-getting-truncated)
  - [Header auth: "not from trusted proxy"](#header-auth-unauthorized---not-from-trusted-proxy)
  - [Header auth: "missing user header"](#header-auth-unauthorized---missing-user-header)
  - [Invalid user object with all-digit hash](#invalid-user-object-warning-on-startup-with-an-all-digit-hash-or-placeholder)
  - [OIDC login fails with CORS-shaped error from untrusted cert](#oidc-login-looks-like-a-cors-error-in-devtools-but-the-idp-is-configured-for-cors-correctly)
- [Docker & image issues](#docker--image-issues)
  - [App Not Starting After Update to 2.0.4](#app-not-starting-after-update-to-204)
  - [Mount Type Mismatch](#mount-type-mismatch)
  - [DockerHub toomanyrequests](#dockerhub-toomanyrequests)
  - [Old image tags fail to pull](#old-image-tags-fail-to-pull)
  - [no matching manifest for linux/arm/v7 (32-bit ARM)](#no-matching-manifest-for-linuxarmv7)
  - [Healthcheck Failing in Docker](#healthcheck-failing-in-docker)
  - [Docker Login Fails on Ubuntu](#docker-login-fails-on-ubuntu)
- [Styles and Assets not Updating](#styles-and-assets-not-updating)
- [Config Validation Errors](#config-validation-errors)
- [Ngrok Invalid Host Headers](#invalid-host-header-while-running-through-ngrok)
- [Warnings in the Console during deploy](#warnings-in-the-console-during-deploy)
- [Status Checks Failing](#status-checks-failing)
- [Widgets](#widgets)
  - [Diagnosing Widget Errors](#widget-errors)
  - [Fixing Widget CORS Errors](#widget-cors-errors)
  - [CORS Proxy connect ECONNREFUSED or ENOTFOUND](#cors-proxy-connect-econnrefused--or-getaddrinfo-enotfound)
  - [CORS Proxy Target-URL host blocked or scheme rejected](#cors-proxy-target-url-host--is-blocked--must-use-http-or-https)
  - [CORS Proxy TLS certificate errors](#cors-proxy-unable_to_verify_leaf_signature-or-err_tls_cert_altname_invalid)
  - [Widget Shows Error Incorrectly](#widget-shows-error-incorrectly)
  - [Weather Forecast Widget 401](#weather-forecast-widget-401)
  - [Widget Displaying Inaccurate Data](#widget-displaying-inaccurate-data)
  - [Public IP Widget not working for ipinfo or ipquery providers](#public-ip-widget-not-working-for-ipinfo-or-ipquery-providers)
- [Font Awesome Icons not Displaying](#font-awesome-icons-not-displaying)
- [Copy to Clipboard not Working](#copy-to-clipboard-not-working)
- [How-To / Reference](#how-to--reference)
  - [How to Reset Local Settings](#how-to-reset-local-settings)
  - [How to make a bug report](#how-to-make-a-bug-report)
  - [How-To Open Browser Console](#how-to-open-browser-console)
  - [Git Contributions not Displaying](#git-contributions-not-displaying)

---

## Config not loading

The server reads `conf.yml` from `user-data/` on each request (that's `/app/user-data/` on Docker), which Dashy serves to the base of the domain (like `[your-dashy-instance]/conf.yml`). If you forget to pass in a config, or you put it in the wrong place, you'll see the default Dashy config.

### You see the default dashboard instead of yours

If the page reads "Welcome to your new dashboard!" with a Getting Started section, Dashy is serving the `conf.yml` that ships inside the image. Yours is mounted to the wrong place.

Since v3.0.0 the config lives at `/app/user-data/conf.yml` (NOT `/app/public/conf.yml`)

```bash
docker run -d -p 8080:8080 -v ~/dashy/user-data:/app/user-data lissy93/dashy:latest
```

To see what the container is actually reading: `docker exec -it dashy head /app/user-data/conf.yml`

### "Failed to fetch configuration: Server responded with status 404"

`/app/user-data` is there, but it has no `conf.yml` in it. Usually a host directory got mounted over the top and is empty, or the file is named something else. The name of the root config has to be exactly `conf.yml`.

A file that exists but can't be read by uid 1000 gives the same 404, so check [permissions](#permission-denied-or-read-only-filesystem-eacces-erofs) if the path looks right.

Put the file in place before starting the container:

```bash
mkdir -p ~/dashy/user-data
cp conf.yml ~/dashy/user-data/conf.yml
```

### Config came back after a permissions fix, but auth is ignored

Restart the container after fixing permissions, even though the dashboard already looks repaired. Because auth is resolved once at startup, while `conf.yml` is re-read on every request. See [Permission denied or read-only filesystem](#permission-denied-or-read-only-filesystem-eacces-erofs) for the ownership side, including Synology, NAS and SELinux cases.

```bash
sudo chown -R 1000:1000 ~/dashy/user-data
docker restart dashy
```

### Edits on the host never reach the container

You changed `conf.yml`, restarted, and nothing moved. This is the classic single-file bind mount problem. Most editors save by writing a new file and renaming it over the old one, which breaks the mount's link to the original inode.

Mount the parent directory rather than the file:

```yaml
volumes:
  - ./user-data:/app/user-data
```

Also check the host side is a real path. A bare name with no `/` or `./` in front is a named volume, not a bind mount.

### Your browser shows an old config

Try opening in a private window, do you see the new one now? If so, this is some local settings you've set. Just clear it from Dashy's config menu under Config --> "Reset Local Settings". See [How to Reset Local Settings](#how-to-reset-local-settings).

If the private window is stale too, and you have `appConfig.enableServiceWorker: true`, the PWA cache is serving an old copy. Unregister the worker under the Application tab in devtools, then reload.

### Empty dashboard with "Login" in the title

This one is intentional. With auth configured and no session yet, the server sends a cut-down config containing only what the login screen needs. Your sections come back once you're signed in. If you do sign in and it's still empty, the problem is auth rather than config. See [Auth & OIDC](#auth--oidc).

### Static hosting ignores config changes

On Netlify, Vercel, GitHub Pages and similar there's no Dashy server, so `conf.yml` gets copied into `dist/` at build time. Editing it afterwards does nothing until you build again. Commit your change to `user-data/conf.yml` and let the host rebuild, or run `yarn build` locally.

### Nothing loads when Dashy is behind a sub-path

Serve Dashy at `example.com/dashy` and the browser still requests `example.com/conf.yml`. The config path is fixed at build time as `/conf.yml`, and `BASE_URL` doesn't apply to it, so a proxy forwarding only `/dashy/*` never sees the request.

Give Dashy its own hostname or subdomain, or build from source with `VITE_APP_CONFIG_PATH` set to the full path. Any `VITE_` variable is read during the build, so setting one on the prebuilt Docker image won't do anything.

---

## Config not saving

There should be an error message, explaining the reason the config save failed. First check [browser console](#how-to-open-browser-console) (<kbd>F12</kbd> --> Console), and then your server-side logs in the terminal. Then, see the following sections for solutions to each possible error.

<a id="config-not-saving-on-vercel--netlify--cdn"></a>
<a id="possible-issue-1-unable-to-call-save-endpoint-from-cdnstatic-server"></a>
<a id="unable-to-write-confyml-eacces-permission-denied"></a>
<a id="permission-denied-saving-config"></a>
<a id="possible-issue-2-unable-to-save"></a>
<a id="config-not-updating"></a>
<a id="config-still-not-updating"></a>
<a id="possible-issue-3-saved-but-not-updating"></a>

### Permission denied or read-only filesystem (EACCES, EROFS)

The container can't write to your `conf.yml` or its directory. Almost always an ownership mismatch: the host directory belongs to a different uid than the one Dashy runs as inside the container. Less commonly a read-only mount or an over-strict file mode.

The `COPY --chown=node:node` in the Dockerfile only sets ownership *inside the image*. When you bind-mount `user-data`, your host directory takes over that path entirely, so its ownership is what counts - not the image's.

Dashy runs as UID=1000 (default non-root node user). You can see this by running `docker exec -it dashy id`. Then, check who owns the user-data directory, with: `docker exec -it dashy ls -la /app/user-data` - if it's not `1000` then that's the issue. And the solution is just to run `sudo chown -R 1000:1000 /path/to/your/user-data` to set the right owner.

Fixes:
1. **Hand the directory to uid 1000** (recommended). Keeps the container running as a non-root user, which is how Dashy is built to run `sudo chown -R 1000:1000 /path/to/your/user-data`
2. **Run the container as your own user** if `chown` isn't practical (multi-user hosts, NAS appliances, host directories you don't want relabelled). Add `--user $(id -u):$(id -g)` to `docker run`, or set `user: "1000:1000"` (or your host uid:gid) on the service in `docker-compose.yml`.
3. **Loosen a single-file mount** if its mode is `444`. Narrow case, only fixes that one symptom: `chmod 644 /path/to/conf.yml`

**Common mistakes**
- **Using uid/gid 1001.** A common guess on Synology, Unraid and similar where 1001 is the host's first user. Dashy's container is 1000, not 1001.
- **`chmod` alone for a UID mismatch.** Loosens permissions but doesn't change who owns the file. You need `chown`.
- **`chmod -R 777` or `775`.** Works as a workaround, masks the real problem, weakens security. Use `chown` to the right uid instead.

**Other gotchas:**
- **Named Docker volumes** (created with `docker volume create`) inherit ownership from whatever first writes to them. If an older container set them up as root, the diagnose step will show that. Recreate the volume or `chown` the underlying directory under `/var/lib/docker/volumes/`.
- **macOS hosts** rarely hit this. Docker Desktop transparently maps host uid to container uid through its VM. If saves are failing on macOS, look elsewhere first.
- **Storage layers that ignore POSIX permissions** (some NAS app-data folders use FUSE, SMB or overlay mounts where `chmod` and `chgrp` are silent no-ops). Bind-mount user-data from a native filesystem path instead.

### Kubernetes ConfigMap mount is read-only

If you've mounted your `conf.yml` from a ConfigMap, writes will always fail with `EROFS` regardless of UID. ConfigMap volumes are read-only by design. Either treat the ConfigMap as the source of truth and edit it directly (saves through the UI won't work), or use a writable volume type like a `PersistentVolumeClaim` for `user-data/`.

### SELinux or AppArmor blocks the write

If you're on RHEL/Fedora, or systems with SELinux or AppArmour, and you've confirmed permissions are fine, and container's UID matches the host owner, but you still see `EACCES`.

For SELinux, add the `:Z` flag to your volume mount so Docker relabels it for the container (e.g. `volumes: [ './user-data:/app/user-data:Z' ]`)

For AppArmor, check `dmesg` for `apparmor="DENIED"` lines and adjust the profile. Disabling enforcement is a last resort.

### Backup step fails so save aborts

Before each save, Dashy backs up the current `conf.yml` to `user-data/config-backups/`. If that folder can't be written, the whole save aborts with `Unable to backup conf.yml`.

Two ways out:
1. Point `BACKUP_DIR` at a writable path
2. Set `DISABLE_CONFIG_BACKUPS=true` to skip the backup step entirely

### Save button is missing or returns 403 Forbidden

Have you got auth setup? If so, make sure you are logged in as an admin, or set `type: admin` to your user in `conf.yml`.

Beyond that, there's several other config options which prevent saving the config file, so if you didn't mean to add them, just remove from `conf.yml`
- **`appConfig.preventWriteToDisk: true`** disables disk save and the button
- **`appConfig.preventLocalSave: true`** disables the "Local" save option
- **`appConfig.disableConfiguration: true`** hides the editor entirely. `disableConfigurationForNonAdmin: true` does the same just for non-admins.

### Save unavailable on Vercel, Netlify or other static hosts
Updating source config file on static hosts is not possible, since they have no Node server, nor have write access to modify any files.
The "Local" save mode will still work (changes are just persisted in your browser), but the real solution is to copy/export the updated YAML and replace it in the source config file in your repo.

Related: [#1465](https://github.com/Lissy93/dashy/issues/1465).

### `/config-manager/save` returns 404 or HTML
How are you running/serving Dashy?
If you've got a reverse proxy which only forwards specific path prefixes then maybe you're missing the `/config-manager/*` API endpoints?
Check the failed request in the browser's Network tab. If the response is HTML (a proxy error page) or a plain 404, your proxy isn't routing the path. Add `/config-manager/` to whatever you're forwarding, or simplify the rules so everything reaches Dashy.

Or if you're serving up the compiled Vue app directly, instead of using the Node server, then the endpoint won't be available.

### "Invalid filename" when saving a sub-page

The save endpoint rejects sub-page filenames with path separators or non-yaml extensions. Check the `path:` value of the page in your `pages:` block. It needs to be a plain basename like `home.yml`, not `pages/home.yml` or `home.txt`.

### "Cannot save to an external URL"

The sub-page you are editing is loaded from a remote URL. Dashy can't write back to that URL.
You will need to edit the file at it's origin yourself instead (click the Export to view the YAML).
Or you could download the config to `user-data/something.yml`, and update `path:` to point to the local version.

### Saved successfully but the UI shows the old config

Two unrelated causes share this symptom:

1. **Local storage overrides the file.** Dashy lets users save settings locally in browser storage, which take priority over `conf.yml`. Open Dashy in incognito to confirm. If the changes appear there, clear local settings via Config menu > "Clear Local Settings".
2. **Docker isn't picking up file changes.** Some text editors save by replacing the inode, which breaks single-file bind mounts. Edit the file in place, or mount the parent directory rather than the single file. [More background](https://medium.com/@jonsbun/why-need-to-be-careful-when-mounting-single-files-into-a-docker-container-4f929340834).

<a id="container-crashes-or-restart-loop-after-saving-config"></a>

### Container crashes or restart loop after saving (3.1.0 and 3.1.1 only)

If your container crashes or restart-loops right after clicking save, with logs like `ERR_HTTP_HEADERS_SENT` or `ERR_STREAM_WRITE_AFTER_END`, this was a known double-`res.end()` bug in 3.1.0 and 3.1.1. Fixed in v3.2.13 and later.

```bash
docker pull lissy93/dashy:latest
docker compose up -d --force-recreate
```

### Intentionally read-only mode

To hide the "Save to disk" UI for everyone, set `appConfig.preventWriteToDisk: true` in `conf.yml`. This is a UI-only flag — the `/config-manager/save` server endpoint itself is gated by the configured auth method (`auth.users` with `ENABLE_HTTP_AUTH`, OIDC/Keycloak admin role, header-auth, etc.), so anyone unauthenticated or non-admin already can't save regardless of this flag. For Docker users, you can harden things further by mounting `user-data` (or just `conf.yml`) as read-only — the kernel will refuse the write even before the server tries.

---

## `Refused to Connect` in Modal or Workspace View

This is not an issue with Dashy, but instead caused by the target app preventing direct access through embedded elements.

As defined in [RFC-7034](https://datatracker.ietf.org/doc/html/rfc7034), for any web content to be accessed through an embedded element, it must have the [`X-Frame-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) HTTP header set to `ALLOW`. If you are getting a `Refused to Connect` error then this header is set to `DENY` (or `SAMEORIGIN` and it's on a different host). Thankfully, for self-hosted services, it is easy to set these headers.

These settings are usually set in the config file for the web server that's hosting the target application, here are some examples of how to enable cross-origin access with common web servers:

### NGINX

In NGINX, you can use the [`add_header`](https://nginx.org/en/docs/http/ngx_http_headers_module.html) module within the app block.

```text
server {
  ...
  add_header X-Frame-Options SAMEORIGIN always;
}
```

Then reload with `service nginx reload`

### Caddy

In Caddy, you can use the [`header`](https://caddyserver.com/docs/caddyfile/directives/header) directive.

```text
header {
  X-Frame-Options SAMEORIGIN
}
```

### Apache

In Apache, you can use the [`mod_headers`](https://httpd.apache.org/docs/current/mod/mod_headers.html) module to set the `X-Frame-Options` in your config file. This file is usually located somewhere like `/etc/apache2/httpd.conf

```text
Header set X-Frame-Options: "ALLOW-FROM http://[dashy-location]/"
```

### LightHttpd

```text
Content-Security-Policy: frame-ancestors 'self' https://[dashy-location]/
```

---

## 404 / Routing issues

### 404 On Static Hosting

If you're seeing Dashy's 404 page on initial load/ refresh, and then the main app when you go back to Home, then this is likely caused by the Vue router, and if so can be fixed in one of two ways.

The first solution is to switch the routing mode, from HTML5 `history` mode to `hash` mode, by rebuilding Dashy with the `VITE_APP_ROUTING_MODE=hash` build-time environment variable set.

If this works, but you wish to continue using HTML5 history mode, then a bit of extra [server configuration](/docs/management#web-server-configuration) is required. This is explained in more detaail in the [Vue Docs](https://router.vuejs.org/guide/essentials/history-mode.html). Once completed, you can then use `VITE_APP_ROUTING_MODE=history` (the default) again, for neater URLs.

### 404 after Launch from Mobile Home Screen

Similar to the above issue, if you get a 404 after using iOS and Android's "Add to Home Screen" feature, then this is caused by Vue router.
It can be fixed by rebuilding Dashy with the `VITE_APP_ROUTING_MODE=hash` build-time environment variable set.

See also: [#628](https://github.com/Lissy93/dashy/issues/628), [#762](https://github.com/Lissy93/dashy/issues/762)

### 404 On Multi-Page Apps

Similar to above, if you get a 404 error when visiting a page directly on multi-page apps, then this can be fixed by rebuilding Dashy with the `VITE_APP_ROUTING_MODE=hash` build-time environment variable set, then refreshing the page.

See also: [#670](https://github.com/Lissy93/dashy/issues/670), [#763](https://github.com/Lissy93/dashy/issues/763)

### Dashy hosted at a sub-path (e.g. `example.com/dashy`)

If the homepage works but sub-page links 404, or assets fail to load, it's almost always the base path.
Rebuild with `BASE_URL` set to the sub-path - leading slash, no trailing slash:

Vue Router uses this to prefix every route. Without it, links resolve to `/home/...` instead of `/dashy/home/...` and skip your reverse proxy altogether. More detail in [web-server configuration](/docs/management#web-server-configuration).

---

## Sub-pages

### Sub-page shows "Unable to find config for ..."

This means Dashy couldn't match the URL segment to any entry in your `pages:` list. A few causes:

#### Old bookmark from before an upgrade
Slugs are now trimmed more aggressively (e.g. `🌐 Command Center` used to give `-command-center`, now gives `command-center`). Re-bookmark from the nav, or update the URL by hand.

#### The page was renamed or removed
The URL no longer resolves to anything. Check the `pages:` array in `conf.yml` and confirm the sub-page still exists.

#### The path points at an unreachable file
If the sub-config YAML can't be fetched (404, CORS, auth), you'll see "Unable to load config from ..." instead. Verify the `path:` is correct, reachable from the browser, and CORS-open if remote.

#### Page name literally "Main"
`main` is reserved in the URL scheme to mean "the root config". A page named "Main" becomes reachable at `/home/main-page` (not `/home/main`). Rename the page if that's confusing.

#### Service worker is serving a stale app
Hard-refresh (<kbd>Ctrl</kbd> + <kbd>F5</kbd>) after a major upgrade. The PWA cache may still be pointing at old routes. Also see [Styles and Assets not Updating](#styles-and-assets-not-updating).

### Sub-page missing from nav, or won't open when clicked

If page defined in `pages:` is nowhere in the nav bar, or its link goes to a different page, then there's probably something wrong with the name you chose. Note that Dashy strips out any non-alphanumeric characters.
- Ensure each page does have a valid `name` and `path` field
- Check two pages don't have the same/similar name
- Check each page has a name which has at least some alpha-numeric characters
- Very long names could be being stripped/truncated

### Sub-page ignores its theme, layout or appConfig

This is by design. Only the `appConfig` from your root `conf.yml` is used - theme, layout, iconSize, statusCheck, etc. are inherited globally so behaviour stays consistent across pages.

If you put `appConfig` inside a sub-page YAML, it's silently dropped on load. Move the values to the root config. See [Restrictions](/docs/pages-and-sections#restrictions).

### Sub-config files return 404

If your `conf.yml` references additional pages via `pages:` and the browser shows `Sub-config load failed: /something.yml`, the cause is almost always a Docker mount that only exposes `conf.yml` and not the rest of `user-data/`.

If you've done this:

```yaml
volumes:
  - ./my-conf.yml:/app/user-data/conf.yml
```

Only `conf.yml` exists inside the container. Anything it references (sub-configs, custom icons, fonts, CSS) isn't there.

Mount the directory instead:

```yaml
volumes:
  - ./user-data:/app/user-data
```

Now everything in your `user-data` folder is reachable at the web root. Same applies to `docker run -v`.

### Remote Config Not Loading

If you've got a multi-page dashboard, and are hosting the additional config files yourself, then CORS rules will apply. A CORS error will look something like:

```text
Access to XMLHttpRequest at 'https://example.com/raw/my-config.yml' from origin 'http://dashy.local' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The solution is to add the appropriate headers onto the target server, to allow it to accept requests from the origin where you're running Dashy.

If it is a remote service, that you do not have admin access to, then another option is to proxy the request. Either host your own, or use a publicly accessible service, like [allorigins.win](https://allorigins.win), e.g: `https://api.allorigins.win/raw?url=https://pastebin.com/raw/4tZpaJV5`. For git-based services specifically, there's [raw.githack.com](https://raw.githack.com/)

---

## Build & memory errors

### Yarn Error

For more info, see [Issue #1](https://github.com/Lissy93/dashy/issues/1)

First of all, check that you've got yarn installed correctly - see the [yarn installation docs](https://classic.yarnpkg.com/en/docs/install) for more info.

If you're getting an error about scenarios, then you've likely installed the wrong yarn... (you're [not](https://github.com/yarnpkg/yarn/issues/2821) the only one!). You can fix it by uninstalling, adding the correct repo, and reinstalling, for example, in Debian:

- `sudo apt remove yarn`
- `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
- `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
- `sudo apt update && sudo apt install yarn`

Alternatively, as a workaround, you have several options:

- Try using [NPM](https://www.npmjs.com/get-npm) instead: So clone, cd, then run `npm install`, `npm run build` and `npm start`
- Try using [Docker](https://www.docker.com/get-started) instead, and all of the system setup and dependencies will already be taken care of. So from within the directory, just run `docker build -t lissy93/dashy .` to build, and then use docker start to run the project, e.g: `docker run -it -p 8080:8080 lissy93/dashy` (see the [deploying docs](/docs/deployment#deploy-with-docker) for more info)

### The engine "node" is incompatible with this module

You'll see this error while running `yarn`, if your version of Node is too old or incompatible. 

The solution is to upgrade to the latest LTS version of Node 24.
Alternatively (not recommended), you can ignore this warning by running `yarn install --ignore-engines`.

Dashy needs Node **`^22.18.0 || >=24.11.0`** - that's either the Node 22 LTS line at 22.18.0 or newer, or 24.11.0 or newer.
Check your current version with `node --version`.
The easiest way to do this, is to use a version manager, like [nvm](https://github.com/nvm-sh/nvm) to quickly download and apply different node versions. Run `nvm install 24` then `nvm use 24`.

### `yarn build` fails inside the container

If you run `docker exec <container> yarn build` and get `vite: not found` (or similar), it's because the published image ships only production dependencies. The build toolchain (vite, vue-tsc, sass, etc.) lives in `devDependencies` and isn't installed in the runtime image.

You almost certainly don't need to rebuild. Dashy's Express server reads `user-data/conf.yml` on every request, so config changes show up on a page refresh, no rebuild required.

If you genuinely need a fresh build (you've patched something in `src/`), do it on the host with `yarn install && yarn build`, or build a custom image from a checkout of the repo.

### High CPU or RAM Usage on Startup

When the Dashy container first starts, it runs a Vue production build in parallel with the server. This is **a one-time cost per container start**, but it briefly uses around **1–1.5 GB of RAM and 100% of one CPU core** for anywhere from 30 seconds to several minutes (depending on host speed). On Pi-class hardware or VMs with less than 1 GB of RAM, this spike can be enough to lock up the host.

**To work around it:**

1. **Allocate at least 1 GB of RAM to the container** - 2 GB is recommended on Raspberry Pi or low-powered VMs. Anything below 512 MB is unlikely to complete the first build.
2. **Set explicit Docker resource limits** so the build can't starve other services on the same host:
   ```yaml
   services:
     dashy:
       image: lissy93/dashy:latest
       deploy:
         resources:
           limits:
             memory: 2g
             cpus: '1.5'
   ```
3. **Wait it out** - once the build completes, idle CPU drops to near zero and idle RAM is typically under 100 MB. If you watch `docker stats`, you'll see the spike taper off.
4. If the spike never tapers (i.e., Dashy stays at 100% CPU forever and never serves the page), see [Heap limit Allocation failed](#ineffective-mark-compacts-near-heap-limit-allocation-failed) below - that usually means the build was killed mid-way and is being retried.

See also: [#1585](https://github.com/Lissy93/dashy/issues/1585), [#969](https://github.com/Lissy93/dashy/issues/969), [#1500](https://github.com/Lissy93/dashy/issues/1500), [#877](https://github.com/Lissy93/dashy/issues/877)

### Ineffective mark-compacts near heap limit Allocation failed

If you see an error message, similar to:

```text
<--- Last few GCs --->

[61:0x74533040] 229060 ms: Mark-sweep (reduce) 127.1 (236.9) -> 127.1 (137.4) MB, 5560.7 / 0.3 ms (average mu = 0.286, current mu = 0.011) allocation failure scavenge might not succeed

<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

This is likely caused by insufficient memory allocation to the container. When the container first starts up, or has to rebuild, the memory usage spikes, and if there isn't enough memory, it may terminate. This can be specified with, for example: `--memory=1024m`. For more info, see [Docker: Runtime options with Memory, CPUs, and GPUs](https://docs.docker.com/config/containers/resource_constraints/). For more context on what the spike is, see [High CPU or RAM Usage on Startup](#high-cpu-or-ram-usage-on-startup) above.

See also: [#380](https://github.com/Lissy93/dashy/issues/380), [#350](https://github.com/Lissy93/dashy/issues/350), [#297](https://github.com/Lissy93/dashy/issues/297), [#349](https://github.com/Lissy93/dashy/issues/349), [#510](https://github.com/Lissy93/dashy/issues/510), [#511](https://github.com/Lissy93/dashy/issues/511) and [#834](https://github.com/Lissy93/dashy/issues/834)

### Command failed with signal "SIGKILL"

In Docker, this can be caused by not enough memory. When the container first starts up, or has to rebuild, the memory usage spikes, and so a larger allocation may be required. This can be specified with, for example: `--memory=1024m`. For more info, see [Docker: Runtime options with Memory, CPUs, and GPUs](https://docs.docker.com/config/containers/resource_constraints/)

See also [#624](https://github.com/Lissy93/dashy/issues/624)

### Node Sass does not yet support your current environment

Caused by node-sass's binaries being built for a for a different architecture
To fix this, just run: `yarn rebuild node-sass`

### Unreachable Code Error

An error similar to: `Fatal error in , line 0. Unreachable code, FailureMessage Object: 0xffe6c8ac. Illegal instruction (core dumped)`
Is related to a bug in a downstream package, see [nodejs/docker-node#1477](https://github.com/nodejs/docker-node/issues/1477).
Usually, updating your system and packages will resolve the issue.

See also: [#776](https://github.com/Lissy93/dashy/issues/776)

### Error: Cannot find module './_baseValues'

Clearing the cache should fix this: `yarn cache clean`
If the issue persists, remove (`rm -rf node_modules\ yarn.lock`) and reinstall (`yarn`) node_modules

---

## Auth & OIDC

### Auth Validation Error: "should be object"

In V 1.6.5 an update was made that in the future will become a breaking change. You will need to update you config to reflect this before V 2.0.0 is released. In the meantime, your previous config will continue to function normally, but you will see a validation warning. The change means that the structure of the `appConfig.auth` object is now an object, which has a `users` property.

For more info, see [this announcement](https://github.com/Lissy93/dashy/discussions/177).

You can fix this by replacing:

```yaml
auth:
- user: xxx
  hash: xxx
```

with

```yaml
auth:
  users:
  - user: xxx
    hash: xxx
```

### Keycloak Redirect Error

Check the [browser's console output](#how-to-open-browser-console), if you've not set any headers, you will likely see a CORS error here, which would be the source of the issue.

You need to allow Dashy to make requests to Keycloak, and Keycloak to redirect to Dashy. The way you do this depends on how you're hosting these applications / which proxy you are using, and examples can be found in the [Management Docs](/docs/management#setting-headers).

For example, add the access control header to Keycloak, like:

`Access-Control-Allow-Origin [URL-of Dashy]`

Note that for requests that transport sensitive info like credentials, setting the accept header to a wildcard (`*`) is not allowed - see [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials), so you will need to specify the actual URL.

You should also ensure that Keycloak is correctly configured, with a user, realm and application, and be sure that you have set a valid redirect URL in Keycloak ([screenshot](https://user-images.githubusercontent.com/1862727/148599768-db4ee4f8-72c5-402d-8f00-051d999e6267.png)).

For more details on how to set headers, see the [Example Headers](/docs/management#setting-headers) in the management docs, or reference the documentation for your proxy.

If you're running in Kubernetes, you will need to enable CORS ingress rules, see [docs](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#enable-cors), e.g:

```text
nginx.ingress.kubernetes.io/cors-allow-origin: "https://dashy.example.com"
nginx.ingress.kubernetes.io/enable-cors: "true"
```

See also: #479, #409, #507, #491, #341, #520

### OIDC or Keycloak failure on numeric client IDs

If your IdP rejects the login with an *"invalid client"* / *"client not found"* error, and your `clientId` is a long numeric value, the cause is almost certainly YAML number parsing.

YAML parses unquoted numeric tokens as Numbers, and JavaScript can't represent integers larger than 2^53 (~16 digits) without losing precision. So an unquoted numeric `clientId` will be silently truncated (e.g. `918756876419824312` → `918756876419824300`), or - for very large values - converted to scientific notation (e.g. `9.187568764198242e+37`), and the IdP will reject it.

The fix is to wrap the `clientId` in quotes in your `conf.yml` so it gets parsed as a string:

```yaml
appConfig:
  auth:
    enableOidc: true
    oidc:
      clientId: "918756876419824312"
      endpoint: https://idp.example.com/
```

The same applies to `auth.keycloak.clientId`. Dashy will print a warning in the [browser console](#how-to-open-browser-console) when it detects a numeric `clientId`, to help diagnose this.

See also: #1941

### Redirect loop after login
Your `endpoint` probably includes `.well-known/openid-configuration`. Drop everything from `.well-known` onwards

### invalid_redirect_uri
The redirect URI Authentik has registered for the provider doesn't exactly match the URL Dashy is being served from. Register both the bare URL and the trailing-slash version, and make sure the scheme matches (`http` vs `https`).

### Login works in the browser but the dashboard refuses to save anything (403)
Dashy's server is rejecting the id_token. Check Dashy's container logs for `[auth-oidc] token verification failed`. Common causes:
- **Issuer mismatch**. Authentik is behind a reverse proxy that isn't sending `X-Forwarded-Proto: https`, so its discovery document advertises `http://` while you configured `https://` in Dashy. Fix the proxy or set `AUTHENTIK_HOST`/`AUTHENTIK_LISTEN__TRUSTED_PROXY_CIDRS` on the Authentik containers
- **Audience mismatch**. The `aud` claim in the id_token is not `dashy`. Confirm the provider's Client ID is exactly `dashy` (no leading or trailing whitespace)
- **Dashy server can't reach Authentik**. The Dashy container fails to fetch the discovery document. Exec into the container and try `wget -qO- https://auth.example.com/application/o/dashy/.well-known/openid-configuration`
- **Clock skew**. The middleware allows 30 seconds of drift. If a container's clock is further off than that, `exp`/`iat` checks fail

If you've exhausted these and need a stop-gap, set `oidc.disableServerSideCheck: true` to skip server-side verification and fall back to client-side-only auth. This leaves Dashy's server routes unprotected, so only use it in a trusted environment (see the [OIDC docs](/docs/authentication/oidc)).

### Sent back to the login page after a while
Your SSO session's id_token expired, so Dashy signs you out (rather than leaving a logged-in-looking UI whose API calls all silently 401). For OIDC, set `oidc.enableSilentRenew: true` to refresh the session in the background before it lapses; this needs your provider to issue refresh tokens (Dashy adds the `offline_access` scope automatically when it's on). Otherwise, just sign in again when prompted.

### Logged in but no admin controls
The id_token doesn't include the groups claim. Open browser devtools after logging in, find the call to `/application/o/dashy/userinfo/`, and check the response. You should see a `groups` array containing `dashy-admins`. If not:
- The `groups` scope mapping doesn't exist, or is not attached to the provider's property mappings
- The user is not in the `dashy-admins` group
- The conf.yml is missing `groups` from `scope:` and Authentik is therefore not sending it

### Login works but Dashy errors on the callback with "OIDC signinCallback returned no user"
The id_token came back without a username claim. Confirm the provider has "profile" and "email" in its scopes and the "Include claims in id_token" is on

### Sign-out leaves you stuck on Authentik
Dashy redirects to Authentik's end-session endpoint on logout. If Authentik's invalidation flow prompts for confirmation (the default), that's expected - click through it. To skip the prompt entirely, change the provider's invalidation flow to one without a consent stage.

### Untrusted certificate from Authentik
Self-signed certs make Dashy's server-side fetch of the discovery document fail. Use a real cert (Let's Encrypt, or your homelab CA installed into the Dashy image) for the Authentik hostname.

### Numeric client_id getting truncated
Don't use numeric-only client IDs. If you must, wrap the value in quotes in conf.yml so YAML treats it as a string

### Header auth: "Unauthorized - not from trusted proxy"
The IP your reverse proxy presents as isn't in `auth.headerAuth.proxyWhitelist`. For Docker it's usually the bridge IP, not your LAN IP. Find it with `docker compose exec dashy getent hosts <proxy-service-name>` and paste that into `proxyWhitelist`. Restart Dashy after the change.

### Header auth: "Unauthorized - missing user header"
The source IP check passed, but the configured `userHeader` isn't on the request. Either the proxy isn't sending it (check the Cloudflare Access policy / Authelia forward-auth / Tailscale Serve config is actually applied), or the header name in `conf.yml` doesn't match what the proxy sends. Header matching is case-insensitive, but spelling and prefix matter.

### "Invalid user object" warning on startup with an all-digit hash or placeholder
YAML parsed your `hash:` value as a number rather than a string, because every character was a digit. Common when using placeholder all-zero hashes under header auth. Quote it: `hash: "0000..."`. Same root cause as the numeric `clientId` issue above.

### OIDC login looks like a CORS error in devtools, but the IdP is configured for CORS correctly
If your identity provider uses a self-signed or untrusted certificate, the browser will silently abort `oidc-client-ts`'s token-exchange fetch and surface it as a CORS-shaped error. Open the IdP URL directly in a new tab, accept the certificate warning, then retry the Dashy login. The real fix is to use a trusted cert (Let's Encrypt, or a homelab CA installed into the browser's trust store).

---

## Docker & image issues

### App Not Starting After Update to 2.0.4

Version 2.0.4 introduced changes to how the config is read, and the app is build. If you were previously mounting `/public` as a volume, then this will over-write the build app, preventing it from starting. The solution is to just pass in the file(s) / sub-directories that you need. For example:

```yaml
volumes:
- /srv/dashy/conf.yml:/app/user-data/conf.yml
- /srv/dashy/item-icons:/app/public/item-icons
```

### Mount Type Mismatch

```text
Error response from daemon: ... mount through procfd: not a directory:
Are you trying to mount a directory onto a file (or vice-versa)?
```

This means the host side and container side of your volume don't agree on whether the target is a file or a directory.

Recommended pattern: mount a host directory onto `/app/user-data`. The directory must exist on the host and contain at least a `conf.yml`:

```bash
mkdir -p ~/dashy-data
cp /path/to/your/conf.yml ~/dashy-data/conf.yml
docker run -d -p 8080:8080 -v ~/dashy-data:/app/user-data lissy93/dashy:latest
```

If you'd rather mount a single file (`-v ~/conf.yml:/app/user-data/conf.yml`), the host path must be a file that already exists, otherwise Docker creates a directory in its place and you'll see this error.

### DockerHub `toomanyrequests`

This situation relates to error messages similar to one of the following, returned when pulling, updating or running the Docker container from Docker Hub.

```text
Continuing execution. Pulling image lissy93/dashy:release-1.6.0
error pulling image configuration: toomanyrequests
```

or

```text
You have reached your pull rate limit. You may increase the limit by authenticating and upgrading: https://www.docker.com/increase-rate-limit
```

When DockerHub returns one of these errors, or a `429` status, that means you've hit your rate limit. This was [introduced](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/) last year, and prevents unauthenticated or free users from running docker pull more than 100 times per 6 hours.
You can [check your rate limit status](https://www.docker.com/blog/checking-your-current-docker-pull-rate-limits-and-status/) by looking for the `ratelimit-remaining` header in any DockerHub responses.

#### Solution 1 - Use an alternate container registry

- Dashy is also available through GHCR, which at present does not have any hard limits. Just use `docker pull ghcr.io/lissy93/dashy:latest` to fetch the image
- You can also build the image from source, by cloning the repo, and running `docker build -t dashy .` or use the pre-made docker compose

#### Solution 2 - Increase your rate limits

- Logging in to DockerHub will increase your rate limit from 100 requests to 200 requests per 6 hour period
- Upgrading to a Pro for $5/month will increase your image requests to 5,000 per day, and any plans above have no rate limits
- Since rate limits are counted based on your IP address, proxying your requests, or using a VPN may work

### Old image tags fail to pull

If `docker pull` returns `manifest unknown` or `manifest for lissy93/dashy:arm32v7 not found`, the cause is a stale architecture-specific tag in your compose file or run command. Tags like `:arm32v7`, `:arm64v8`, and `:multi-arch` are no longer published.

The `:latest` tag is multi-arch and works on amd64 and arm64 without you having to pick a variant. Just use:

```yaml
image: lissy93/dashy:latest
```

Docker fetches the right architecture for your host automatically. To pin a version, use a semver tag, e.g. `lissy93/dashy:3.2.14`.

### `no matching manifest for linux/arm/v7`

Dashy's Docker image is built for `amd64` and `arm64` only (`4.4.10` was the last release to include a 32-bit `armv7` build). On a 32-bit ARM host (Raspberry Pi 2, or a Pi 3/4 running a 32-bit OS), `docker pull`, `docker run` or `docker compose up` fails with:

```
no matching manifest for linux/arm/v7 in the manifest list entries
```

(Pi 1 and Pi Zero report `linux/arm/v6`.) 32-bit ARM was dropped because the build toolchain (Rolldown) no longer ships a 32-bit ARM binary, and Node 24 dropped 32-bit ARM too. To fix it:

- **Recommended:** reinstall your host OS as 64-bit (`arm64`). The Raspberry Pi 3 and newer all support it, and Dashy's `arm64` image is then selected automatically.
- **Stay on 32-bit:** pin the last image that shipped `armv7`:
  ```yaml
  image: lissy93/dashy:4.4.10
  ```

### Healthcheck Failing in Docker

If `docker ps` shows the Dashy container as `unhealthy`, the periodic healthcheck (`node services/healthcheck.js`, run every 5 minutes by default) couldn't reach the local server.

#### SSL-enabled Dashy

The healthcheck reads the same cert paths as the main server (`/etc/ssl/certs/dashy-pub.pem` and `/etc/ssl/certs/dashy-priv.key`) to detect whether to probe HTTPS or HTTP. If you've mounted certs at non-default paths via `SSL_PUB_KEY_PATH` / `SSL_PRIV_KEY_PATH`, the healthcheck will pick those up automatically as long as those env vars are set in the container environment (not just at run time).

#### Custom port

If you've set `PORT` to override the default 8080, the healthcheck honors the same env var, so it should work without changes. Make sure `PORT` is set in the container environment, not just in the host-side Docker port mapping.

#### Container is unhealthy past the grace period

The healthcheck has a 20s `start-period` after which failures start counting. The image is prebuilt, so startup is just `node server.js` binding to a port - fast even on a Pi. If the container is still `unhealthy` past the grace period, the server has likely crashed. Check `docker logs <container>` for the real error (usually a malformed `conf.yml` or a missing `user-data` mount).

See also: [#1410](https://github.com/Lissy93/dashy/issues/1410)

### Docker Login Fails on Ubuntu

Run `sudo apt install gnupg2 pass && gpg2 -k`

---

## Styles and Assets not Updating

If you find that your styles and other visual assets work when visiting `ip:port` by not `dashy.domain.com`, then this is usually caused by caching. In your browser, do a hard-refresh (<kbd>Ctrl</kbd> + <kbd>F5</kbd>). If you use Cloudflare, then you can clear the cache through the management console, or set the cache level to Bypass for certain files, under the Rules tab.

---

## Config Validation Errors

The configuration file is validated against [Dashy's Schema](https://github.com/Lissy93/dashy/blob/master/src/utils/config/ConfigSchema.json) using AJV.

First, check that your syntax is valid, using [YAML Validator](https://codebeautify.org/yaml-validator/) or [JSON Validator](https://codebeautify.org/jsonvalidator). If the issue persists, then take a look at the [schema](https://github.com/Lissy93/dashy/blob/master/src/utils/config/ConfigSchema.json), and verify that the field you are trying to add/ modify matches the required format. You can also use [this tool](https://www.jsonschemavalidator.net/s/JFUj7X9J) to validate your JSON config against the schema, or run `yarn validate-config`.

If you're trying to use a recently released feature, and are getting a warning, this is likely because you've not yet updated the the current latest version of Dashy.

If the issue still persists, you should raise an issue.

---

## Invalid Host Header while running through ngrok

Just add the [-host-header](https://ngrok.com/docs#http-host-header) flag, e.g. `ngrok http 8080 -host-header="localhost:8080"`

---

## Warnings in the Console during deploy

Please acknowledge the difference between errors and warnings before raising an issue about messages in the console. It's not unusual to see warnings about a new version of a certain package being available, an asset bundle bing oversized or a service worker not yet having a cache. These shouldn't have any impact on the running application, so please don't raise issues about these unless it directly relates to a bug or issue you're experiencing. Errors on the other hand should not appear in the console, and they are worth looking into further.

---

## Status Checks Failing

If you're using status checks, and despite a given service being online, the check is displaying an error, there are a couple of things you can look at:

If your service requires requests to include any authorization in the headers, then use the  `statusCheckHeaders` property, as described in the [docs](/docs/status-indicators#setting-custom-headers).

If you are still having issues, it may be because your target application is blocking requests from Dashy's IP. This is a [CORS error](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), and can be fixed by setting the headers on your target app, to include:

```text
Access-Control-Allow-Origin: https://location-of-dashy/
Vary: Origin
```

If the URL you are checking has an unsigned certificate, or is not using HTTPS, then you may need to disable the rejection of insecure requests. This can be done by setting `statusCheckAllowInsecure` to true for a given item.

If your service is online, but responds with a status code that is not in the 2xx range, then you can use `statusCheckAcceptCodes` to set an accepted status code.

If you get an error, like `Service Unavailable: Server resulted in Invalid URL`, even when it's definitely online, this is most likely caused by missing the protocol. Don't forget to include `https://` (or whatever protocol) before the URL, and ensure that if needed, you've specified the port.

Running Dashy in HOST network mode, instead of BRIDGE will allow status check access to other services in HOST mode. For more info, see [#445](https://github.com/Lissy93/dashy/discussions/445).

If you have firewall rules configured, then ensure that they don't prevent Dashy from making requests to the other services you are trying to access.

Currently, the status check needs a page to be rendered, so if this URL in your browser does not return anything, then status checks will not work. This may be modified in the future, but in the meantime, a fix would be to make your own status service, which just checks if your app responds with whatever code you'd like, and then return a 200 plus renders an arbitrary message. Then just point `statusCheckUrl` to your custom page.

For further troubleshooting, use an application like [Postman](https://postman.com) to diagnose the issue. Set the parameter to `GET`, and then make a call to: `https://[url-of-dashy]/status-check/?&url=[service-url]`. Where the service URL must have first been encoded (e.g. with `encodeURIComponent()` or [urlencoder.io](https://www.urlencoder.io/))

If you're serving Dashy though a CDN, instead of using the Node server or Docker image, then the Node endpoint that makes requests will not be available to you, and all requests will fail. A workaround for this may be implemented in the future, but in the meantime, your only option is to use the Docker or Node deployment method.

---

## Widgets

### Widget Errors

#### Find Error Message

If an error occurs when fetching or rendering results, you will see a short message in the UI. If that message doesn't adequately explain the problem, then you can [open the browser console](/docs/troubleshooting#how-to-open-browser-console) to see more details.

#### Check Config

Before proceeding, ensure that if the widget requires auth your API is correct, and for custom widgets, double check that the URL and protocol is correct.

#### Timeout Error

If the error message in the console includes: `Error: timeout of 500ms exceeded`, then your Glances endpoint is slower to respond than expected. You can fix this by [setting timeout](/docs/widgets#setting-timeout) to a larger value. This is done on each widget, with the `timeout` attribute, and is specified in ms. E.g. `timeout: 5000` would only fail if no response is returned within 5 seconds.

#### CORS error

If the console message mentions to corss-origin blocking, then this is a CORS error, see: [Fixing Widget CORS Errors](#widget-cors-errors)

#### More Info

If you're able to, you can find more information about why the request may be failing in the Dev Tools under the Network tab, and you can ensure your endpoint is correct and working using a tool like Postman.

### Widget CORS Errors

The most common widget issue is a CORS error. This is a browser security mechanism which prevents the client-side app (Dashy) from from accessing resources on a remote origin, without that server's explicit permission (e.g. with headers like Access-Control-Allow-Origin). See the MDN Docs for more info: [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

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

For more info on how to set headers, see: [Setting Headers](/docs/management#setting-headers) in the management docs

#### Option 3 - Proxying Request

You can route requests through Dashy's built-in CORS proxy. Instructions and more details can be found [here](/docs/widgets#proxying-requests). If you don't have control over the target origin, and you are running Dashy either through Docker, with the Node server or on Netlify, then this solution will work for you.

Just add the `useProxy: true` option to the failing widget.

#### Option 4 - Use a plugin

For testing purposes, you can use an addon, which will disable the CORS checks. You can get the Allow-CORS extension for [Chrome](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en-US) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin/), more details [here](https://mybrowseraddon.com/access-control-allow-origin.html)

### CORS Proxy `connect ECONNREFUSED ...` or `getaddrinfo ENOTFOUND ...`

The target host is unreachable from the Dashy container. If the target is on the same host as Dashy, **don't use `localhost`** - inside a Docker container that resolves to the container itself, not the host. Use the host's LAN IP, the Docker bridge gateway, or `host.docker.internal` (on Docker Desktop). If the target is on a different Docker network, attach Dashy to that network too.

### CORS Proxy `Target-URL host '...' is blocked` / `must use http:// or https://`

To prevent the CORS proxy from being abused as a Server-Side Request Forgery vector, Dashy refuses to proxy a small number of host/scheme combinations by default:

- **Cloud instance metadata services** - `169.254.169.254`, `metadata.google.internal`, and the matching IPv6 forms. These are reserved magic addresses on AWS, Azure, GCP, DigitalOcean, Hetzner, Oracle Cloud and most other providers. A widget that successfully fetches them on a cloud-hosted Dashy can leak the host's IAM credentials, so they're blocked unconditionally.
- **Non-HTTP(S) schemes** - `file://`, `ftp://`, `gopher://`, `javascript:`, `data:`, and similar. The proxy is meant for HTTP APIs only.

If you're running Dashy in a fully isolated/private environment and you've deliberately decided you want to allow these (for example, you genuinely need to query your cloud provider's metadata API from a widget), you can opt out of all proxy restrictions by setting the environment variable:

```bash
DANGEROUSLY_DISABLE_PROXY_RESTRICTIONS=true
```

The variable is named so loudly because flipping it on a Dashy instance that's exposed to anything other than fully trusted users re-opens the SSRF surface - anyone who can hit `/cors-proxy` can then use Dashy as a relay to reach internal services. **Don't set it on cloud-hosted or internet-exposed deployments.**

Note that this is an all-or-nothing escape hatch, not a per-host allowlist. If you only need to reach one specific host that's currently blocked, please open a feature request describing the use case.

### CORS Proxy `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `ERR_TLS_CERT_ALTNAME_INVALID`

The target's certificate can't be verified - it's self-signed, issued by a private CA, or issued for a different hostname than the one you're requesting. If you trust the host, add `allowInsecure: true` to the widget (`useProxy: true` is needed too). To keep verification on instead, mount your CA into the container and point `NODE_EXTRA_CA_CERTS` at it. See [Ignoring Certificate Errors](/docs/widgets#ignoring-certificate-errors).

### Widget Shows Error Incorrectly

When there's an error fetching or displaying a widgets data, then it will be highlighted in yellow, and a message displayed on the UI.

In some instances, this is a false positive, and the widget is actually functioning correctly.
If this is the case, you can disable the UI error message of a given widget by setting: `ignoreErrors: true`

### Weather Forecast Widget 401

A 401 error means your API key is invalid, it is not an issue with Dashy.

Usually this happens due to an error in your config. If you're unsure, copy and paste the [example](/docs/widgets#weather) config, replacing the API key with your own.

Check that `apiKey` is correctly specified, and nested within `options`. Ensure your input city is valid.

To test your API key, try making a request to `https://api.openweathermap.org/data/2.5/weather?q=London&appid=[your-api-key]`

If [Weather widget](/docs/widgets#weather-forecast) is working fine, but you are getting a `401` for the [Weather Forecast widget](/docs/widgets#weather-forecast), then this is also an OWM API key issue.
Since the forecasting API requires an upgraded plan. ULPT: You can get a free, premium API key by filling in [this form](https://home.openweathermap.org/students). It's a student plan, but there's no verification to check that you are still a student.

A future update will be pushed out, to use a free weather forecasting API.

See also: [#803](https://github.com/Lissy93/dashy/issues/803), [#789](https://github.com/Lissy93/dashy/issues/789), [#577](https://github.com/Lissy93/dashy/issues/577), [#621](https://github.com/Lissy93/dashy/issues/621), [#578](https://github.com/Lissy93/dashy/issues/578), [#806](https://github.com/Lissy93/dashy/discussions/806)

### Widget Displaying Inaccurate Data

If any widget is not displaying the data you expect, first confirm that your config is correct, then try manually calling the API endpoint.

If the raw API output is correct, yet the widget is rendering incorrect results, then it is likely a bug, and a ticket should be raised. You can start to debug the issue, by looking at the widget's code ([here](https://github.com/Lissy93/dashy/tree/master/src/components/Widgets)), and the browser console + networking tab.

If the API itself is returning incorrect, incomplete or inaccurate data then an issue needs to be raised **with the API provider** (not Dashy!). You can find the API provider included within the widget docs, or for a full list see the [Privacy Docs](/docs/privacy#widgets).

See also: [#807](https://github.com/Lissy93/dashy/issues/807) (re, domain monitor)

### Public IP Widget not working for `ipinfo` or `ipquery` providers

If you've set `options.provider` to either `ipinfo` and `ipquery` and the requests are failing, it's likley that they're being blocked. Check your adblocker (uBlock, PrivacyBadger, etc), DNS block lists (PiHole, AdGuard, etc). Or, try proxying the request (with `useProxy: true`) or just try a different provider.

---

## Font Awesome Icons not Displaying

Usually, Font Awesome will be automatically enabled if one or more of your icons are using Font-Awesome. If this is not happening, then you can always manually enable (or disable) Font Awesome by setting: [`appConfig`](/docs/configuring#appconfig-optional).`enableFontAwesome` to `true`.

If you are trying to use a premium icon, then you must have a [Pro License](https://fontawesome.com/plans). You'll then need to specify your Pro plan API key under `appConfig.fontAwesomeKey`. You can find this key, by logging into your FA account, navigate to Account → [Kits](https://fontawesome.com/kits) → New Kit → Copy Kit Code. The code is a 10-digit alpha-numeric code, and is also visible within the new kit's URL, for example: `81e48ce079`.

<p align="center"><img src="https://i.ibb.co/hZ0D9vs/where-do-i-find-my-font-awesome-key.png" width="600" /></p>

Be sure that you're specifying the icon category and name correctly. You're icon should look be `[category] fa-[icon-name]`. The following categories are supported: `far` _(regular)_, `fas` _(solid)_, `fal`_(light)_, `fad` _(duo-tone)_ and `fab`_(brands)_. With the exception of brands, you'll usually want all your icons to be in from same category, so they look uniform.

Ensure the icon you are trying to use, is available within [FontAwesome Version 5](https://fontawesome.com/v5/search) (we've not yet upgraded to V6, as it works a little differently).

Examples: `fab fa-raspberry-pi`, `fas fa-database`, `fas fa-server`, `fas fa-ethernet`

Finally, check the [browser console](#how-to-open-browser-console) for any error messages, and raise a ticket if the issue persists.

---

## Copy to Clipboard not Working

If the copy to clipboard feature (either under Config --> Export, or Item --> Copy URL) isn't functioning as expected, first check the browser console. If you see `TypeError: Cannot read properties of undefined (reading 'writeText')` then this feature is not supported by your browser.
The most common reason for this, is if you not running the app over HTTPS. Copying to the clipboard requires the app to be running in a secure origin / aka have valid HTTPS cert. You can read more about this [here](https://stackoverflow.com/a/71876238/979052).

As a workaround, you could either:

- Highlight the text and copy / <kbd>Ctrl</kbd> + <kbd>C</kbd>
- Or setup SSL - [here's a guide](/docs/management#ssl-certificates) on doing so

---

## How-To / Reference

### How to Reset Local Settings

Some settings are stored locally, in the browser's storage.

In some instances cached assets can prevent your settings from being updated, in which case you may wish to reset local data.

To clear all local data from the UI, head to the Config Menu, then click "Reset Local Settings", and Confirm when prompted.
This will not affect your config file. But be sure that you keep a backup of your config, if you've not written changes it to disk.

You can also view any and all data that Dashy is storing, using the developer tools. Open your browser's dev tools (usually <kbd>F12</kbd>), in Chromium head to the Application tab, or in Firefox go to the Storage tab. Select Local Storage, then scroll down the the URL Dashy is running on. You should now see all data being stored, and you can select and delete any fields you wish.

For a full list of all data that may be cached, see the [Privacy Docs](/docs/privacy#browser-storage).

### How to make a bug report

#### Step 1 - Where to open issues

You will need a GitHub account in order to raise a ticket. You can then [click here](https://github.com/Lissy93/dashy/issues/new?assignees=lissy93&labels=%F0%9F%90%9B+Bug&template=bug.yml&title=%5BBUG%5D+%3Ctitle%3E) to open a new bug report.

#### Step 2 - Checking it's not already covered

Before submitting, please check that:

- A similar ticket has not previously been opened
- The issue is not covered in the [troubleshooting guide](/docs/troubleshooting) or [docs](https://github.com/Lissy93/dashy/tree/master/docs#readme)

#### Step 3 - Describe the Issue

Your ticket will likely be dealt with more effectively if you can explain the issue clearly, and provide all relevant supporting material.

Complete the fields, asking for your environment info and version of Dashy.
Then describe the issue, briefly explaining the steps to reproduce, expected outcome and actual outcome.

#### Step 4 - Provide Supporting Info

Where relevant please also include:

- A screenshot of the issue
- The relevant parts of your config file
- Logs
  - If client-side issue, then include the browser logs ([see how](#how-to-open-browser-console))
  - If server-side / during deployment, include the terminal output

_Take care to redact any personal info, (like IP addresses, auth hashes or API keys)._

#### Step 5 - Fix Released

A maintainer will aim to respond within 48 hours.
The timeframe for resolving your issue, will vary depending on severity of the bug and the complexity of the fix.
You will be notified on your ticket, when a fix has been released.

Finally, be sure to remain respectful to other users and project maintainers, in line with the [Contributor Covenant Code of Conduct](https://github.com/Lissy93/dashy/blob/master/.github/CODE_OF_CONDUCT#contributor-covenant-code-of-conduct).

### How-To Open Browser Console

When raising a bug, one crucial piece of info needed is the browser's console output. This will help the developer diagnose and fix the issue.

If you've been asked for this info, but are unsure where to find it, then it is under the "Console" tab, in the browsers developer tools, which can be opened with <kbd>F12</kbd>. You can right-click the console, and select Save As to download the log.

To open dev tools, and jump straight to the console:

- Win / Linux: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>
- MacOS: <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>J</kbd>

For more detailed walk through, see [this article](https://support.shortpoint.com/support/solutions/articles/1000222881-save-browser-console-file).

### Git Contributions not Displaying

If you've contributed to Dashy (or any other project), but your contributions are not showing up on your GH profile, or in Dashy's [Credits Page](/docs/credits), then this is likely a git config issue.

These statistics are generated using the username / email associated with commits. This info needs to be setup on your local machine using [`git config`](https://git-scm.com/docs/git-config).

Run the following commands (replacing name + email with your info):

- `git config --global user.name "John Doe"`
- `git config --global user.email johndoe@example.com`

For more info, see [Git First Time Setup Docs](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup).

Note that only contributions to the master / main branch or a project are counted
