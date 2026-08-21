# OIDC

## Step-by-step Guides

We have some provider-specific guides to walk you through configuring OIDC authentication with common services
- [Authentik](/docs/authentik)
- [Authelia](/docs/authelia-oidc)
- [Zitadel](/docs/zitadel)
- [Pocket ID](/docs/pocketid)
- [Keycloak](/docs/keycloak)

## About OIDC

Dashy also supports using a general [OIDC compatible](https://openid.net/connect/) authentication server. In order to use it, the authentication section needs to be configured:

```yaml
appConfig:
  disableConfigurationForNonAdmin: true # Hide the config editor from non-admins (recommended)
  enableServiceWorker: true             # Optional: enables the PWA and offline support
  enableAuthProxyCompat: true           # Recover the PWA after a session expires (needs the service worker)
  auth:
    enableOidc: true                    # Turn OIDC on
    enableGuestAccess: false            # Optional: view the dashboard read-only without signing in
    oidc:
      clientId: dashy                    # Client ID from your provider
      endpoint: https://auth.example.com/application/o/dashy/ # The issuer URL, not the .well-known one
      scope: openid profile email groups # Scopes to request (groups for adminGroup, roles for adminRole)
      adminGroup: dashy-admins           # Members of this group are admins
      adminRole: dashy-admin             # Or grant admin by role instead
      enableSilentRenew: true            # Refresh the session in the background before it expires
      # showLoginPage: false             # If true, login redirects to Dashy's own login page
      # postLogoutRedirectUri: 'https://dashy.example.com' # Where to send users after logout (must be registered with the provider)
      # allowedIssuers: []               # Only for multi-tenant providers to override discovery document
      # disableServerSideCheck: false    # Leave as false / unset. Setting to true makes auth just client-side
```

Because Dashy is a SPA, a [public client](https://datatracker.ietf.org/doc/html/rfc6749#section-2.1) registration with PKCE is needed.

If you set `adminGroup`, include `groups` in `scope` (e.g. `scope: 'openid profile email groups'`) so your IdP actually returns the claim in the id_token. Same goes for `adminRole` and a `roles` scope if your IdP needs one.

Note, that if your `clientId` is numeric, you must place it in quotes. Otherwise YAML parses it as a number, and values longer than JavaScript's safe-integer range (around 15 digits) lose precision, which makes the client ID match fail.

For the provider side (registering the client, redirect URIs, scope mappings), follow one of the [step-by-step guides](#step-by-step-guides) above.

## Admin access

Dashy works out who's an admin from the id_token. Set `adminGroup` to a group name, or `adminRole` to a role name, and anyone with a matching claim can save changes to the config. The server blocks everyone else from saving anyway, and `disableConfigurationForNonAdmin: true` also hides the editor from non-admins so the dashboard is view-only for them.

The claim has to be in the id_token, not just the access token. Most providers include it once you ask for the `groups` (or `roles`) scope. For the group check Dashy reads the `groups` claim, plus GitLab's `groups_direct`. For the role check it reads `roles`, plus Keycloak's `realm_access.roles` and `resource_access.<clientId>.roles`.

If your admins aren't being picked up, decode the id_token (paste it into [jwt.io](https://jwt.io)) and check the claim is there.

## Multi-tenant providers

With a multi-tenant provider (e.g. Microsoft Entra's `organizations` / `common` endpoints), the issuer in the token doesn't match the one in the discovery document, so verification fails. Set `allowedIssuers` to the issuer URL(s) you want to accept:

```yaml
    oidc:
      clientId: dashy
      endpoint: 'https://login.microsoftonline.com/organizations/v2.0/'
      allowedIssuers:
        - 'https://login.microsoftonline.com/<your-tenant-id>/v2.0'
```

When set, tokens are accepted only if their `iss` matches one of these (signature, audience and expiry are still checked). Leave it unset for normal single-tenant providers.

## Guest access

Set `enableGuestAccess: true` to let people view the dashboard read-only without signing in. They get the full config but can't save anything, and sections or items marked `hideForGuests` stay hidden. With it off (the default), anyone who isn't signed in is sent to the login flow.

## Showing Dashy's login page

By default, anyone who isn't signed in is sent straight to your provider's login page (or, with `enableGuestAccess: true`, straight into the dashboard as a guest). Set `showLoginPage: true` under `auth.oidc` to show Dashy's own login page first instead:

```yaml
    oidc:
      clientId: dashy
      endpoint: 'https://your-oidc-provider.example.com'
      showLoginPage: true
```

The page has a button to sign in with your provider, plus a *Proceed as Guest* button if guest access is enabled, so the user picks which they want. This is useful when Dashy is the landing page after another redirect (e.g. a captive portal), where an immediate second redirect off to the IdP is disorienting. It's shown on each page load until you sign in; the choice isn't remembered. See [#2302](https://github.com/lissy93/dashy/issues/2302) for info.

## Using with a PWA

If you turn on the service worker for offline use (`enableServiceWorker: true`), turn on `enableAuthProxyCompat: true` as well. Without it, when your session expires the cached app can keep showing the old page instead of letting the login redirect through. With it on, Dashy spots the expired session on load, drops the service worker, and reloads so you can sign in again.

## How server-side enforcement works

Dashy's server reads `auth.oidc` from `conf.yml` at boot, lazily fetches the OIDC discovery doc + JWKS from your `endpoint`, then verifies the `id_token` the SPA attaches to every API call as `Authorization: Bearer <id_token>`. Tokens that fail signature / issuer / audience / expiry verification are rejected with `401`. Write endpoints (`POST /config-manager/save`) additionally require the `adminGroup` (or `adminRole`) to be present in the token's `groups` / `roles` claims, and non-admins receive `403`. Unauthenticated requests for `/conf.yml` get a stripped response containing only the `auth` block plus a minimal `pageInfo`, just enough for the SPA to bootstrap the login flow. The full config is only served to authenticated users.

Your IdP must include `groups` / `roles` in the id_token, not only the access token, for the admin check to work (most IdPs do this when the `groups` scope is requested).

### Opting out of server-side enforcement

> [!CAUTION]
> This is not recommended (on untrusted networks), as it allows users to bypass all the server-side protection.

Set `disableServerSideCheck: true` under `auth.oidc` to turn off the server-side enforcement. 
This should only be done in a trusted environment, or where you've got your own protections in place or for when server-side verification isn't supported by your provider. It makes OIDC become a purely client-side login page.

## Silent token renewal

By default, when your access token expires Dashy sends you back through the provider's login page to get a new one. On a long-lived session this is visible as a brief flash of the sign-out button and a reload. Setting `enableSilentRenew: true` avoids it: Dashy requests a refresh token and uses it to renew the session in the background, before the token expires, with no interactive round-trip.

```yaml
    oidc:
      clientId: dashy
      endpoint: 'https://your-oidc-provider.example.com'
      scope: 'openid profile email groups'
      adminGroup: admin
      enableSilentRenew: true
```

Notes:
- It is opt-in and off by default. With it off, nothing changes, existing setups are unaffected.
- **Your provider must support the `offline_access` scope.** When this is on, Dashy adds `offline_access` to the scope it requests at sign-in, so the provider issues a refresh token. Most providers support this (Authentik, Keycloak, Authelia, Okta, Auth0, Entra/Azure AD). A few do not, most notably **Google**, which uses `access_type=offline` instead and will reject the scope. Do not enable this flag against a provider that rejects `offline_access`, as it would break the interactive sign-in too. If unsure, test sign-in after enabling it.
- The provider's client/app may also need to be allowed to issue refresh tokens to a public (PKCE) client. In Authentik this is automatic once `offline_access` is an allowed scope.
- If a silent renewal fails for any reason (no refresh token issued, refresh token expired or revoked, the provider returns no fresh id_token, a provider error), Dashy falls back to the normal interactive sign-in. Renewal can save a round-trip, but the interactive flow always remains the safety net.
- Renewal is driven by the access token's lifetime. If your provider issues an id_token with a much shorter lifetime than the access token, renewal may lag; keeping the two lifetimes equal (the common default) works best.
- With multiple tabs open against a provider that rotates refresh tokens on use, tabs can briefly contend for the refresh token; the affected tab simply falls back to interactive sign-in. This is inherent to browser-based refresh tokens, not specific to Dashy.

## Setting logout redirect URL

When you log out, Dashy sends you to your provider's logout page, and by default that's where you stay. Set `postLogoutRedirectUri` if you'd like the provider to send you back to Dashy (or anywhere else) once it's done:

```yaml
    oidc:
      clientId: dashy
      endpoint: 'https://your-oidc-provider.example.com'
      postLogoutRedirectUri: 'https://dashy.example.com'
```

The URL is sent to the provider as `post_logout_redirect_uri`, so it needs to be registered as a valid post-logout redirect URI in your client's settings - most providers have a field for this right next to the sign-in redirect URIs. If it's not registered, many providers will show an error instead of completing the logout, so give the logout button a quick test after setting it. Left unset, nothing changes and logout ends at the provider as before. See [#2261](https://github.com/lissy93/dashy/issues/2261) for info.
