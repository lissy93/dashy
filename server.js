/**
 * This is the main entry point for the web server which serves Dashy
 * Reads some config, runs some checks, prints a lil welcome, starts server
 * Registers the Express app.js, which has all the routes, middleware, auth
 * Note: The app must first be built (yarn build) before this script is run
 * */

const dns = require('dns');
const os = require('os');
const http = require('http');

const app = require('./services/app');
const sslServer = require('./services/utils/ssl-server');
const printMessage = require('./services/utils/print-message');

/* Checks if app is running within a container, from env var */
const isDocker = !!process.env.IS_DOCKER;

/* Checks env var for port. If undefined, will use Port 8080 for Docker, or 4000 for metal */
const port = process.env.PORT || (isDocker ? 8080 : 4000);

/* Let Node choose the unspecified address unless HOST is explicitly set. */
const host = process.env.HOST || undefined;

/* Gets the users local IP and port, then calls to print welcome message */
const printWelcomeMessage = () => {
  dns.promises.lookup(os.hostname())
    .then(({ address }) => {
      const ip = process.env.HOST || address || 'localhost';
      console.log(printMessage(ip, port, isDocker)); // eslint-disable-line no-console
    })
    .catch(() => {
      console.log(`Dashy server has started (${port})`); // eslint-disable-line no-console
    });
};

/* Create HTTP server from app on port, and print welcome message */
http.createServer(app)
  .listen(port, host, () => {
    printWelcomeMessage();
  })
  .on('error', (err) => {
    console.warn('Unable to start Dashy\'s Node server\n', err); // eslint-disable-line no-console
  });

/* Check, and if possible start SSL server too */
sslServer.startSSLServer(app);
