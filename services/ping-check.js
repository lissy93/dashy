/**
 * This file contains the Node.js code, used for the optional ping check feature
 * It accepts many parameters (host, count, timeout) and will make a system ping icmp
 * request and then resolve the average response time.
 */
const ping = require('ping');

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
    const count = decodeURIComponent(params.get('count')) || 0;
    const timeout = decodeURIComponent(params.get('timeout')) || 0;
    if (!host || host === 'undefined') {
      immediateError(render, 'No host given for ping check.');
      return;
    }
    const configuration = {
      timeout: Math.round(timeout/1000),
      min_reply: count > 0 ? count : undefined,
    };
    ping.promise.probe(host)
      .then((response) => {
        const results = {
          successStatus: response.alive,
          message: response.alive ? `UP (${response.time} ms)` : "DOWN",
          timeTaken: response.time,
        };
        render(JSON.stringify(results));
      })
      .catch((error) => {
        immediateError(render, 'Ping check failed : ' + (error.message || 'Unknown error'));
      });
  }
};
