/**
 * This file contains the Node.js code, used for the optional ping check feature
 * It accepts many parameters (host, count, timeout) and will make a system ping icmp
 * request and then resolve the average response time.
 */
const ping = require('pingman');
const net = require('net');

/* Returned if the URL params are not present or correct */
const immediateError = (render, error) => {
  render(JSON.stringify({
    successStatus: false,
    message: error || 'Ping check failed for unknown reason.',
  }));
};

/* Main function, will check if a URL present, and call function */
module.exports = (paramStr, render) => {
  if (!paramStr || !paramStr.includes('=')) {
    immediateError(render);
  } else {
    // Prepare the parameters, which are got from the URL
    const params = new URLSearchParams(paramStr);
    const host = decodeURIComponent(params.get('host'));
    const count = Number(decodeURIComponent(params.get('count'))) || 2;
    const timeout = Number(decodeURIComponent(params.get('timeout'))) || 2000;
    if (!host || typeof host !== 'string') {
      immediateError(render, 'Invalid host given for ping check.');
      return;
    }
    (async () => {
      try {
        const configuration = {
          timeout: Math.round(timeout/1000),
          numberOfEchos: count,
          IPV4: net.isIPv4(host),
          IPV6: net.isIPv6(host),
        };
        const response = await ping(host, configuration);
        const results = {
          successStatus: response.alive,
          message: `${response.host} ${response.numericHost == response.host ? '' : `(${response.numericHost}) `} is ${response.alive ? `UP (${response.avg} ms)` : 'DOWN'}`,
          timeTaken: response.time,
        };
        render(JSON.stringify(results));
      } catch (error) {
        immediateError(render, 'Ping check failed : ' + (error.message || 'Unknown error'));
      }
    })();
  }
};
