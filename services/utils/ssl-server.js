const fs = require('fs');
const util = require('util');
const https = require('https');

const promise = util.promisify;
const stat = promise(fs.stat);

const host = process.env.HOST || undefined;

const httpsCerts = {
  private: process.env.SSL_PRIV_KEY_PATH || '/etc/ssl/certs/dashy-priv.key',
  public: process.env.SSL_PUB_KEY_PATH || '/etc/ssl/certs/dashy-pub.pem',
};

const isDocker = !!process.env.IS_DOCKER;
const SSLPort = process.env.SSL_PORT || (isDocker ? 443 : 4001);
const redirectHttps = process.env.REDIRECT_HTTPS !== 'false';

const printNotSoGood = (msg) => {
  console.log(`SSL Not Enabled: ${msg}`);
};

const printSuccess = () => {
  console.log(`🔐 HTTPS server successfully started (port: ${SSLPort} ${isDocker ? 'of container' : ''})`);
};

// Check if the SSL certs are present and SSL should be enabled
let enableSSL = false;
const checkCertificateFiles = stat(httpsCerts.public).then(() => {
  return stat(httpsCerts.private).then(() => {
    enableSSL = true;
  }).catch(() => { printNotSoGood('Private key not present'); });
}).catch(() => { printNotSoGood('Public key not present'); });

const startSSLServer = (app) => {
  checkCertificateFiles.then(() => {
    // If SSL should be enabled, create a secured server and start it
    if (enableSSL) {
      const httpsServer = https.createServer({
        key: fs.readFileSync(httpsCerts.private),
        cert: fs.readFileSync(httpsCerts.public),
      }, app);
      httpsServer.listen(SSLPort, host, () => { printSuccess(); });
    }
  });
};

const middleware = (req, res, next) => {
  if (enableSSL && redirectHttps && req.protocol === 'http') {
    res.redirect(`https://${req.hostname + ((SSLPort === 443) ? '' : `:${SSLPort}`) + req.url}`);
  } else {
    next();
  }
};

module.exports = { startSSLServer, middleware };
