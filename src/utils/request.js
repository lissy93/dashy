/**
 * Lightweight fetch wrapper that provides an axios-compatible API.
 * Replaces axios for all client-side HTTP requests.
 *
 * Supports: .get(), .post(), .put(), .request()
 * Returns: { data, status, statusText, headers }
 * `headers` is a plain object with lowercase keys (like axios), NOT the
 * native `Headers` instance `fetch` returns - so callers can safely use
 * `response.headers['some-header']` instead of `.get('some-header')`.
 * Throws on non-2xx responses (matching axios behavior)
 */

import { makeBasicAuthHeaders } from '@/utils/auth/Auth';
import { getApiAuthState } from '@/utils/auth/getApiAuthHeader';
import { getOidcAuth, isOidcEnabled } from '@/utils/auth/OidcAuth';
import { getKeycloakAuth, isKeycloakEnabled } from '@/utils/auth/KeycloakAuth';
import { statusErrorMsg, statusMsg } from '@/utils/logging/CoolConsole';

/** Check if a request URL targets the local Dashy server */
function isLocalRequest(url) {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  const { origin } = window.location;
  const domain = import.meta.env.VITE_APP_DOMAIN;
  return url.startsWith(origin) || (domain && url.startsWith(domain));
}

function hasAuthorization(headers) {
  return Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');
}

/* Normalizes a native `Headers` instance (what fetch returns) into a plain,
   lowercase-keyed object, matching axios' response.headers shape. Tolerates
   already-plain objects (e.g. test mocks) by lowercasing their keys too. */
function normalizeHeaders(headers) {
  const plain = {};
  if (!headers) return plain;
  if (typeof headers.forEach === 'function' && typeof headers.get === 'function') {
    headers.forEach((value, key) => { plain[key.toLowerCase()] = value; });
    return plain;
  }
  Object.keys(headers).forEach((key) => { plain[key.toLowerCase()] = headers[key]; });
  return plain;
}

/* Reads a response header, tolerating both a native Headers instance
   (what fetch returns, and what test mocks should use to match it) and a
   plain object (what the normalized response above - and looser mocks -
   pass). Case-insensitive either way. */
export const readHeader = (headers, name) => {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name) ?? undefined;
  return headers[name] ?? headers[name.toLowerCase()];
};

function ssoState() {
  return { oidc: isOidcEnabled(), keycloak: isKeycloakEnabled() };
}

/* Convert string key from backend into human issue of why bearer token failed */
function reportBearerIssue(reason) {
  if (reason === 'missing') return;
  const messages = {
    expired: 'SSO token expired.',
    malformed: 'SSO token is malformed; sign in again if renewal does not recover it.',
    'encrypted-jwe': 'SSO token is encrypted. Dashy needs signed JWT tokens, not encrypted JWE tokens.',
    storage: 'SSO token could not be read from browser storage.',
  };
  statusErrorMsg('SSO', messages[reason] || `SSO token is not usable (${reason}).`);
}

/* Triggers OIDC session renewal to enabled provider (called if get 401) */
async function renewSsoSession({ oidc, keycloak }) {
  if (oidc) return getOidcAuth()?.renewForApiRequest?.() || false;
  if (keycloak) return getKeycloakAuth()?.renewForApiRequest?.() || false;
  return false;
}

class RequestError extends Error {
  constructor(message, opts = {}) {
    super(message);
    this.name = 'RequestError';
    this.response = opts.response || undefined;
    this.request = opts.request || undefined;
    this.code = opts.code || undefined;
    this.timeout = opts.timeout === true ? true : undefined;
  }
}

/**
 * Core request function. Accepts an axios-style config object.
 * @param {Object} config - { method, url, headers, data, timeout, params }
 * @returns {Promise<{data, status, statusText, headers}>}
 */
async function makeRequest(config, retriedAfterRenew = false) {
  const {
    method = 'GET',
    url,
    headers = {},
    data,
    timeout,
    params,
  } = config;

  // Build URL with query params
  let fullUrl = url;
  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams(params);
    fullUrl += (url.includes('?') ? '&' : '?') + searchParams.toString();
  }

  // Timeout via AbortController
  const controller = new AbortController();
  let timeoutId;
  if (timeout) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  const fetchOptions = {
    method: method.toUpperCase(),
    headers: { ...headers },
    signal: controller.signal,
  };

  // For local API requests, attach auth headers when configured
  // Bearer (OIDC / Keycloak id_token) takes precedence over basic-auth cookie header
  const isLocal = isLocalRequest(fullUrl);
  const sso = isLocal ? ssoState() : null;

  if (isLocal && !hasAuthorization(fetchOptions.headers)) {
    const bearer = getApiAuthState();
    if (bearer.ok) {
      Object.assign(fetchOptions.headers, bearer.header);
    } else if (sso.oidc || sso.keycloak) {
      reportBearerIssue(bearer.reason);
    } else {
      const authConfig = makeBasicAuthHeaders();
      if (authConfig.headers) {
        Object.assign(fetchOptions.headers, authConfig.headers);
      }
    }
  }

  // Attach body for non-GET/HEAD requests
  if (data != null && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
    if (typeof data === 'string') {
      fetchOptions.body = data;
    } else {
      fetchOptions.body = JSON.stringify(data);
      // Auto-set Content-Type if not already provided
      const hasContentType = Object.keys(fetchOptions.headers)
        .some((k) => k.toLowerCase() === 'content-type');
      if (!hasContentType) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }
  }

  try {
    const res = await fetch(fullUrl, fetchOptions);

    // Parse response - try JSON first, fall back to text
    let responseData;
    const text = await res.text();
    try { responseData = JSON.parse(text); } catch { responseData = text; }

    const response = {
      data: responseData,
      status: res.status,
      statusText: res.statusText,
      headers: normalizeHeaders(res.headers),
    };

    // Throw on non-2xx (matching axios behavior)
    if (!res.ok) {
      if (res.status === 401 && isLocal && !retriedAfterRenew && (sso.oidc || sso.keycloak)) {
        statusMsg('SSO', 'API request was unauthorized; attempting session renewal.');
        if (await renewSsoSession(sso)) return makeRequest(config, true);
        statusErrorMsg('SSO', 'Session renewal failed; reload or sign in again.');
      }
      throw new RequestError(
        `Request failed with status ${res.status}`,
        { response },
      );
    }

    return response;
  } catch (err) {
    if (err instanceof RequestError) throw err;
    // Network error or abort/timeout
    const isTimeout = err.name === 'AbortError';
    const error = new RequestError(
      isTimeout ? `timeout of ${timeout}ms exceeded` : err.message,
      { request: true, code: isTimeout ? 'ECONNABORTED' : undefined, timeout: isTimeout },
    );
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** GET request: request.get(url, config?) */
makeRequest.get = (url, config = {}) => makeRequest({
  ...config, method: 'GET', url,
});

/** POST request: request.post(url, data?, config?) */
makeRequest.post = (url, data, config = {}) => makeRequest({
  ...config, method: 'POST', url, data,
});

/** PUT request: request.put(url, data?, config?) */
makeRequest.put = (url, data, config = {}) => makeRequest({
  ...config, method: 'PUT', url, data,
});

export default makeRequest;
