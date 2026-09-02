# Security

## Contents

- [Dependencies](#dependencies)
- [Securing your Environment](#securing-your-environment)
- [Security Features](#security-features)
  - [Verifiable Releases](#verifiable-transparent-releases)
  - [Supply Chain](#supply-chain)
  - [Subresource Integrity](#subresource-integrity)
  - [SSL](#ssl)
  - [Authentication](#authentication)
  - [Configuration Lockdown](#configuration-lockdown)
  - [Disabling Features](#disabling-features)
  - [Docker Security](#docker-images)
- [Threat Model](#threat-model)
  - [Intended Deployment](#intended-deployment)
  - [Trust Boundaries](#trust-boundaries)
  - [Assets](#assets)
  - [When Dashy is NOT the Right Choice](#when-dashy-is-not-the-right-choice)
- [Update & Patch Policy](#update--patch-policy)
- [Known Limitations](#known-limitations)
- [Reporting a Security Issue](#reporting-a-security-issue)
- [Non-Issues](#non-issues)
  - [False Positives](#false-positives)
  - [Out-of-Scope](#out-of-scope)

---

## Dependencies

Like most web projects, Dashy builds on a number of open source [dependencies](/docs/credits#dependencies). We keep a close eye on them, to ensure the distributed app is always safe from known issues.

Every package is pinned in a lockfile and installed with integrity checks, so builds are reproducible and nothing gets silently swapped out. Dependabot raises update PRs weekly (covering packages, GitHub Actions, Docker and dev containers). We also have a CI gate for whenever the lockfile changes, to block the merging of any dep with any known issue. Builds are also scanned with Trivy, commits are checked for leaked secrets with TruffleHog, and the CI workflows themselves are linted and zizmor audited.

Releases and Docker images are published with signed build provenance and an SBOM, so you can verify that what you're running really did come from us. The `:latest` docker image is updated at a minimum weekly, so dependencies are up-to-date.

---

## Securing your Environment

There is very little complexity involved with Dashy, and therefore the attack surface is reasonably small, but it is still important to follow best practices for all your self-hosted apps:

- **Use SSL/HTTPS** for securing traffic in transit, see [Management Docs: SSL Certificates](/docs/management#ssl-certificates)
- **Configure authentication** to prevent unauthorized access, see [Authentication Docs](/docs/authentication). For internet-facing instances, use [Keycloak](/docs/authentication#keycloak), [OIDC](/docs/authentication#oidc), or an [alternative server-side method](/docs/authentication#alternative-authentication-methods)
- **Place behind a reverse proxy** if exposing to the internet, see [Management Docs: Network Exposure](/docs/management#network-exposure)
- **Harden your containers** if running in Docker, see [Management Docs: Container Security](/docs/management#container-security)
- **Keep Dashy and your system up-to-date** to ensure known vulnerabilities are patched
- **Configure firewall rules** to restrict access to only necessary ports and networks
- **Use a VPN** for private access without exposing Dashy to the public internet
- **Follow [Docker security best practices](https://docs.docker.com/engine/security/)** including running as non-root, limiting capabilities, and using read-only volumes

---

## Security Features

### Verifiable Transparent Releases

Every release is built in the open by GitHub Actions, never by hand. Each build produces a signed provenance attestation (keyless, tied to GitHub's OIDC identity), so you can confirm that the copy of Dashy you're running was built by our CI, from this repo, and hasn't been altered since. Release tarballs also ship with a SHA256 checksum.

You can browse every attestation on the [attestations page](https://github.com/lissy93/dashy/attestations), or verify a download yourself with `gh attestation verify`.

### Supply Chain

Each build also publishes a Software Bill of Materials (SBOM), a full manifest of every package that went into the app. Together with the provenance above, that gives you an auditable record of exactly what is inside. Images are scanned for known vulnerabilities with Trivy before they go out, and our dependencies are monitored continuously (see [Dependencies](#dependencies)).

### Subresource Integrity

[Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) or SRI is a security feature that enables browsers to verify that resources they fetch are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched resource must match. This prevents the app from loading any resources that have been manipulated, by verifying the files hashes. It safeguards against the risk of an attacker injecting arbitrary malicious content into any files served up via a CDN.

Dashy supports SRI, and it is recommended to enable this if you are hosting your dashboard via a public CDN. To enable SRI, set the `INTEGRITY` environmental variable to `true`.

### SSL

Native SSL support is enabled, for setup instructions, see the [Management Docs](/docs/management#ssl-certificates)

### Authentication

Dashy supports built-in auth, server-based SSO using Keycloak or any OIDC provider, and header-based authentication for reverse proxy setups. Full details of which, along with alternate authentication methods can be found in the [Authentication Docs](/docs/authentication). If your dashboard is exposed to the internet and/ or contains any sensitive info it is strongly recommended to configure access control with Keycloak, OIDC, or another server-side method.

### Configuration Lockdown

Dashy provides several options to restrict what users can modify:

- `appConfig.preventWriteToDisk` - Prevents config changes from being saved to the server
- `appConfig.preventLocalSave` - Prevents config changes from being saved to browser storage
- `appConfig.disableConfiguration` - Hides the config UI from all users
- `appConfig.disableConfigurationForNonAdmin` - Hides the config UI for non-admin users

These can be combined with the `admin` and `normal` user roles to give fine-grained control. Admin users can save config changes, while normal users have read-only access. For more details, see [Built-In Auth: User Roles](/docs/authentication/built-in#user-roles--visibility).

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

### Docker Images

The official image follows container best practices out of the box:
- Runs as a non-root user by default
- Minimal Alpine base, with npm removed from the final image to reduce the attack surface
- Multi-stage build, so only runtime files ship, with no build tooling or source
- Scanned with Trivy for known vulnerabilities before every publish
- Published to GHCR with signed build provenance and an attested SBOM, viewable on the [attestations page](https://github.com/lissy93/dashy/attestations)

To lock things down further, such as read-only volumes and dropped capabilities, see the [container security docs](/docs/management#container-security).

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

## Update & Patch Policy

We follow Semantic Versioning for all releases. Security fixes are shipped as patch releases as quickly as possible and are published via immutable Git tags and Docker image tags. Users are encouraged to pin to a specific version in production and monitor releases on GitHub for security updates. The `:latest` Docker tag is provided for convenience but should not be relied on in production environments.

---

## Known Limitations

| Report | Response |
|---|---|
| "Client-side auth can be bypassed via browser dev tools" | Correct (only if neither `ENABLE_HTTP_AUTH` is set, nor any other auth mode). Client-side auth is a convenience for private networks, not a security boundary. Use server-side auth for untrusted environments. |
| "CORS proxy can make requests to internal services" | Correct. It is built to reach services on your network, and is behind auth when enabled. To turn it off entirely, set `DISABLE_PROXY_ENDPOINTS=true`. |
| "Status checks can be used for SSRF" | Target URLs are set by the admin in `conf.yml`, not end users, and the endpoint needs auth when enabled. Set `DISABLE_PROXY_ENDPOINTS=true` to disable it. |
| "Password hashes are stored in plaintext in conf.yml" | They are SHA-256 hashes, not plaintext passwords. The config file should be readable only by the server admin, and protected by HTTP auth when served. |
| "localStorage/cookies are not encrypted" | Browser storage is scoped to the origin and inaccessible to other domains. On a shared device, use your browser's profile isolation. |
| "No CSRF protection" | Dashy's state-changing operations (config save) are protected by auth middleware. CSRF is a low risk on a private network dashboard. |
| "Docker container runs as root" | It runs as the non-root `node` user by default. To lock it down further, drop capabilities or set a custom `--user`, see the [container security docs](/docs/management#container-security). |
| "Auth cookie is not HttpOnly/Secure" | The token is needed by client-side JavaScript for auth state. On a private network over plain HTTP, the `Secure` flag would break auth. Use HTTPS + a reverse proxy to add these flags if needed. |
| "Iframe/embed widget can load arbitrary URLs" | The widget config is written by the server admin, not end users. If you don't trust your config authors, disable the config editor with `disableConfiguration`. |
| "RSS widget renders HTML content" | RSS content is sanitized with DOMPurify before rendering. Script tags, event handlers and other dangerous elements are stripped. |
| "No Content-Security-Policy headers" | CSP should be configured at the reverse proxy layer, since the correct policy depends on which widgets and icon CDNs you use. Dashy can't set a universal CSP that works for all configurations. |
| "Config backups are not encrypted at rest" | Backups are stored server-side alongside the original config. If an attacker has filesystem access, they already have `conf.yml`. Encryption at rest is the responsibility of the host OS/volume. |
| "No rate limiting on endpoints" | Rate limiting should be applied at the reverse proxy layer, where it can be tuned per-deployment. Dashy is not designed to be directly exposed to untrusted traffic. |
| "A non-admin user can recompute an admin token under `ENABLE_HTTP_AUTH`" | Correct. Any logged-in user can read the config and other users' hashes, so `admin` is not a hard boundary here. Use OIDC or Keycloak for real admin separation. |

---

## Reporting a Security Issue

Please see our [Security.md](https://github.com/Lissy93/dashy/?tab=security-ov-file) doc for how to report issues.
We have an actively monitored security mailbox supporting PGP, as well as a GitHub Advisories vulnerability reporting program.

---

## Non-Issues

### False Positives

These are reported regularly, usually by automated scanners. Each has been checked and found not to be exploitable.

| Report | Response |
|---|---|
| Ping and status checks allow command injection | The host goes to pingman, which runs `spawn('ping', ...)` with no shell, so `;`, `|`, `$()` and backticks are inert. It is one trailing argument, so no extra flags either. |
| The CORS proxy can read arbitrary environment variables | Only `DASHY_`, `VITE_APP_` prefixes are read. The client `VITE_APP_` vars are already in the bundle, and `DASHY_` is opt-in. Unprefixed secrets stay unreachable. |
| `enableInsecure` disables TLS certificate verification | Opt-in per status check, for internal services with self-signed certs, and it only affects that one request. Leave `statusCheckAllowInsecure` unset to keep verification on. The equivalent for widgets is `allowInsecure`, which is also opt-in and per-widget. |
| OIDC does not pin the JWT algorithm (alg confusion or `none`) | Verification uses a remote JWKS, so jose rejects none and symmetric algorithms. The issuer and group claims come from a signature-verified token, so a user cannot forge them. |
| `yaml.load()` allows code execution on parse | In js-yaml 4.x (we use `^4.2.0`) `load` is the safe loader. It does not instantiate custom types, so parsing a config file cannot execute code. |
| Prototype pollution via the config API's Object.assign | `Object.assign` is a shallow set, so a `__proto__` key reparents only that object and is dropped on dump. `Object.prototype` is untouched, and the API is admin-gated behind `ENABLE_API`. |
| Path traversal via the config filename | The save and API write paths run `filename` through `path.basename()` and a `.yml`-only regex, so separators, `..` and null bytes are rejected and writes stay inside the data dir. |
| A committed .env file leaks secrets | `.env` is a fully commented template with no real values. Real secrets go in `.env.local` (gitignored), and the Docker build copies an explicit allowlist, so `.env` never ships. |
| system-info and healthz disclose host details | `system-info` is behind the same auth as every endpoint (open only in zero-auth mode). `healthz` is intentionally open for orchestrators, and version plus uptime is standard there. |
| The http to https redirect uses the `Host` header (open redirect) | A forged Host only redirects the attacker's own request back to itself, so there is no cross-user effect. It is only active when you mount certs and enable the redirect. |

### Out-of-Scope

We do get a LOT of AI-submitted reports for things which come down to deployment decisions (e.g. not enabling auth).
The following list is the most reported non-issues. They are out-of-scope, since they're: 1. the expected behaviour,  2. already clearly documented, and 3. not exploitable in practice.

#### Endpoints are unauthenticated
Dashy ships with no auth configured out-of-the-box. So until you enable or setup auth, all pages and endpoints will be reachable without credentials. That's intentional, as it allows you to put Dashy behind your existing auth setup without hassle. Once an auth system of your choice has been (correctly) configured, all unauthenticated requests will then be rejected.

✅ **Solution**: Enable authentication. See the [authentication docs](https://dashy.to/docs/authentication/) for instructions.

#### The proxy / status / ping can reach localhost and private IPs
The CORS proxy, status-check and ping-check features are *meant* to reach internal and private addresses. Their use case is to let your widgets and service status checks talk the other services you have running within your LAN securely.

These are opt-in requests (you configure widgets or other features to use them). But if you still don't want the proxy reaching internal hosts, don't expose it unauthenticated, or set firewall rules to control what can and cannot be called.

✅ **Solution**: Configure firewall rules, or disable these endpoints entirely with the `DISABLE_PROXY_ENDPOINTS=true` env var

#### Config write leads to stored code execution
Widgets execute user-controlled code. The code for these widgets live in your YAML config, which can be updated by admins with the config-manager save endpoint. It's the expected functionality that admins can update the config, and add widgets here.

✅ **Solution**: Enable auth, and set `appConfig.disableConfigurationForNonAdmin: true`. Or, disable config saving entirely with `appConfig.preventWriteToDisk: true`
