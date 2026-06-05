/**
 * Validation Utilities
 * Used by item's ping check
 */


// Regex IPv4 (0.0.0.0 à 255.255.255.255)
const REGEX_IPV4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Regex IPv6 (Formes standards et compressées conforment à la RFC 4291)
const REGEX_IPV6 = /^(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|(?:[a-fA-F0-9]{1,4}:){1,7}:$|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}$|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}$|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}$|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}$|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}$|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}$|^:(?::[a-fA-F0-9]{1,4}){1,7}$|^::$)/;

// Regex FQDN (Labels de max 63 car., longueur totale max 253 car., TLD de 2 à 63 car.)
const REGEX_FQDN = /^(?=[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*\.[a-zA-Z]{2,63}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*$/;

/**
 * Validates a hostname (including IP V4 and V6 addresses)
 * @param {string} host - The hostname to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateHostname = (host) => {
  if (!host || typeof host !== 'string') return false;
  try {
    return REGEX_FQDN.test(host) || REGEX_IPV4.test(host) || REGEX_IPV6.test(host);
  } catch {
    return false;
  }
};

/**
 * Validates a hostname not including IP V4 and V6 addresses
 * @param {string} host - The hostname to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateStrictHostname = (host) => {
  if (!host || typeof host !== 'string') return false;
  try {
    return REGEX_FQDN.test(host);
  } catch {
    return false;
  }
};

/**
 * Validates an IP V4 or V6 address
 * @param {string} ip - The IP address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  try {
    return REGEX_IPV4.test(ip) || REGEX_IPV6.test(ip);
  } catch {
    return false;
  }
};

/**
 * Validates an IP V4 address
 * @param {string} ip - The IP address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateIpV4Address = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  try {
    return REGEX_IPV4.test(ip);
  } catch {
    return false;
  }
};

/**
 * validates an IP V6 address
 * @param {string} ip - The IP address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateIpV6Address = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  try {
    return REGEX_IPV6.test(ip);
  } catch {
    return false;
  }
};
