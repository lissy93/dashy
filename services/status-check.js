/**
 * This file contains the Node.js code, used for the optional status check feature
 * It accepts a single url parameter, and will make an empty GET request to that
 * endpoint, and then resolve the response status code, time taken, and short message
 */
const request = require('./request');
const { validateTargetUrl } = request;

/* Determines if successful from the HTTP response code */
const getResponseType = (code, validCodes) => {
  if (validCodes && String(validCodes).includes(String(code))) return true;
  if (Number.isNaN(code)) return false;
  const numericCode = parseInt(code, 10);
  return (numericCode >= 200 && numericCode <= 302);
};

/* Makes human-readable response text for successful check */
const makeMessageText = (data) => `${data.successStatus ? '✅' : '⚠️'} `
  + `${data.serverName || 'Server'} responded with `
  + `${data.statusCode} - ${data.statusText}. `
  + `\n⏱️Took ${data.timeTaken} ms`;

/* Makes human-readable response text for failed check */
const makeErrorMessage = (data) => `❌ Service Unavailable: ${data.hostname || 'Server'} `
  + `resulted in ${data.code || 'a fatal error'} ${data.errno ? `(${data.errno})` : ''}`;

const makeErrorMessage2 = (data) => '❌ Service Error - '
  + `${data.status} - ${data.statusText}`;

/* Kicks of a HTTP request, then formats and renders results */
const makeRequest = (url, options, render) => {
  const {
    headers, enableInsecure, acceptCodes, maxRedirects,
  } = options;
  const validCodes = acceptCodes && acceptCodes !== 'null' ? acceptCodes : null;
  const startTime = new Date();
  request({
    url,
    headers,
    maxRedirects,
    timeout: 10000,
    httpsAgent: { rejectUnauthorized: !enableInsecure },
    validateUrl: validateTargetUrl,
  })
    .then((response) => {
      const statusCode = response.status;
      const { statusText } = response;
      const successStatus = getResponseType(statusCode, validCodes);
      const serverName = response.request && response.request.socket
        ? response.request.socket.servername : undefined;
      const timeTaken = (new Date() - startTime);
      const results = {
        statusCode, statusText, serverName, successStatus, timeTaken,
      };
      results.message = makeMessageText(results);
      return results;
    })
    .catch((error) => {
      const response = error ? (error.response || {}) : {};
      const returnCode = response.status || response.code;
      if (validCodes && String(validCodes).includes(returnCode)) { // Success overridden by user
        const results = {
          successStatus: getResponseType(returnCode, validCodes),
          statusCode: returnCode,
          statusText: response.statusText,
          timeTaken: (new Date() - startTime),
        };
        results.message = makeMessageText(results);
        return results;
      } else { // Request failed
        return {
          successStatus: false,
          message: error.response ? makeErrorMessage2(error.response) : makeErrorMessage(error),
        };
      }
    }).then((results) => {
      // Request completed (either successfully, or failed) - render results
      render(JSON.stringify(results));
    });
};

const decodeHeaders = (maybeHeaders) => {
  if (!maybeHeaders) return {};
  const decodedHeaders = decodeURIComponent(maybeHeaders);
  let parsedHeaders = {};
  try {
    parsedHeaders = JSON.parse(decodedHeaders);
  } catch (e) { /* Not valid JSON, will just return false */ }
  return parsedHeaders;
};

/* Returned if the URL param is not present or correct */
const immediateError = (render) => {
  render(JSON.stringify({
    successStatus: false,
    message: '❌ Missing or Malformed URL',
  }));
};

/* Main function, will check if a URL present, and call function */
module.exports = (paramStr, render) => {
  if (!paramStr || !paramStr.includes('=')) {
    immediateError(render);
  } else {
    // Prepare the parameters, which are got from the URL. paramStr is either a bare
    // query string (e.g. Netlify's rawQuery) or Express's mount-relative req.url
    // ('/?url=...') - drop anything before the '?' or the first key is mis-parsed
    const queryStr = paramStr.includes('?') ? paramStr.slice(paramStr.indexOf('?') + 1) : paramStr;
    const params = new URLSearchParams(queryStr);
    const url = decodeURIComponent(params.get('url'));
    const acceptCodes = decodeURIComponent(params.get('acceptCodes'));
    const maxRedirects = decodeURIComponent(params.get('maxRedirects')) || 0;
    const headers = decodeHeaders(params.get('headers'));
    const enableInsecure = !!params.get('enableInsecure');
    if (!url || url === 'undefined') {
      immediateError(render);
      return;
    }
    const options = {
      headers, enableInsecure, acceptCodes, maxRedirects,
    };
    makeRequest(url, options, render);
  }
};
