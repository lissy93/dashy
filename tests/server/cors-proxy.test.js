// @vitest-environment node
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  describe, it, expect, afterEach, beforeAll, afterAll, vi,
} from 'vitest';
import request from 'supertest';

// Isolate from the repo's conf.yml so test behaviour doesn't depend on which
// auth method (if any) the developer has configured locally.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-cors-test-'));
process.env.USER_DATA_DIR = tmpDir;

const app = require('../../services/app');
const { substituteEnv } = require('../../services/endpoints/cors-proxy');

describe('CORS proxy', () => {
  it('rejects missing Target-URL', async () => {
    const res = await request(app).get('/cors-proxy');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Target-URL');
  });

  it('rejects invalid URL', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'not-a-url');
    expect(res.status).toBe(400);
  });

  it('rejects file:// scheme', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'file:///etc/passwd');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('http');
  });

  it('rejects ftp:// scheme', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'ftp://x.com');
    expect(res.status).toBe(400);
  });

  it('blocks cloud metadata IPv4', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://169.254.169.254/');
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('blocked');
  });

  it('blocks cloud metadata decimal bypass', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://2852039166/');
    expect(res.status).toBe(403);
  });

  it('blocks GCP metadata DNS', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://metadata.google.internal/');
    expect(res.status).toBe(403);
  });

  it('blocks Alibaba metadata', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://100.100.100.200/');
    expect(res.status).toBe(403);
  });

  it('blocks gopher:// scheme', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'gopher://evil:70/');
    expect(res.status).toBe(400);
  });

  it('blocks IPv4-mapped IPv6 metadata', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://[::ffff:169.254.169.254]/');
    expect(res.status).toBe(403);
  });

  it('blocks AWS IPv6 metadata', async () => {
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://[fd00:ec2::254]/');
    expect(res.status).toBe(403);
  });

  it('accepts POST method (needed for proxying APIs)', async () => {
    const res = await request(app).post('/cors-proxy').set('Target-URL', 'http://169.254.169.254/');
    expect(res.status).toBe(403); // blocked by SSRF, but NOT by a method filter
  });

  it('rejects malformed CustomHeaders', async () => {
    const res = await request(app)
      .get('/cors-proxy')
      .set('Target-URL', 'http://example.com')
      .set('CustomHeaders', '{bad');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('malformed JSON');
  });

  it('handles OPTIONS preflight', async () => {
    const res = await request(app)
      .options('/cors-proxy')
      .set('Origin', 'http://localhost')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('resolves env-var placeholder in Target-URL before validating', async () => {
    process.env.DASHY_TEST_BLOCKED_HOST = '169.254.169.254';
    try {
      const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://DASHY_TEST_BLOCKED_HOST/');
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('169.254.169.254');
    } finally {
      delete process.env.DASHY_TEST_BLOCKED_HOST;
    }
  });
});

// Spin up a controllable target server, then drive the proxy through real
// failure paths (upstream 4xx/5xx, network refused, port unreachable). This
// is the only way to verify the error-classification branches end-to-end —
// vi.mock can't reach into a `require()` graph that's already been loaded
// by services/app at the top of this file.
describe('CORS proxy error classification', () => {
  let target;
  let targetUrl;
  let handler = (req, res) => res.status(500).end();

  beforeAll(() => new Promise((resolve) => {
    target = http.createServer((req, res) => handler(req, res));
    target.listen(0, '127.0.0.1', () => {
      targetUrl = `http://127.0.0.1:${target.address().port}`;
      resolve();
    });
  }));
  afterAll(() => new Promise((resolve) => target.close(resolve)));

  it('mirrors upstream 4xx status (so frontend can branch on err.response.status)', async () => {
    handler = (req, res) => {
      res.statusCode = 429;
      res.statusMessage = 'Too Many Requests';
      res.end('rate limited');
    };
    const res = await request(app).get('/cors-proxy').set('Target-URL', targetUrl);
    expect(res.status).toBe(429);
    expect(res.body.error.type).toBe('upstream_status');
    expect(res.body.error.status).toBe(429);
    expect(res.body.error.statusText).toBe('Too Many Requests');
  });

  it('mirrors upstream 5xx status', async () => {
    handler = (req, res) => { res.statusCode = 503; res.end('busy'); };
    const res = await request(app).get('/cors-proxy').set('Target-URL', targetUrl);
    expect(res.status).toBe(503);
    expect(res.body.error.type).toBe('upstream_status');
  });

  it('returns 502 + upstream_error when upstream refuses connection', async () => {
    // Port 1 is reserved (tcpmux) — guaranteed nothing listening, ECONNREFUSED
    const res = await request(app).get('/cors-proxy').set('Target-URL', 'http://127.0.0.1:1');
    expect(res.status).toBe(502);
    expect(res.body.error.type).toBe('upstream_error');
    // Specific cause is still preserved in the body, just not in the type label
    expect(res.body.error.code).toBe('ECONNREFUSED');
  });

  it('does not crash when target server hangs up mid-request', async () => {
    handler = (req, res) => { res.socket.destroy(); };
    const res = await request(app).get('/cors-proxy').set('Target-URL', targetUrl);
    expect(res.status).toBe(502);
    expect(res.body.error.type).toBe('upstream_error');
  });

  it('does not forward the Allow-Insecure control header to the target', async () => {
    let received = null;
    handler = (req, res) => { received = req.headers; res.end('{}'); };
    const res = await request(app)
      .get('/cors-proxy')
      .set('Target-URL', targetUrl)
      .set('Allow-Insecure', 'true');
    expect(res.status).toBe(200);
    expect(received['allow-insecure']).toBeUndefined();
  });

  it('resolves env-var placeholders inside a Basic auth header', async () => {
    let received = null;
    handler = (req, res) => { received = req.headers; res.end('{}'); };
    process.env.DASHY_TEST_BASIC_PASS = 'hunter2';
    try {
      const basic = (creds) => `Basic ${Buffer.from(creds, 'latin1').toString('base64')}`;
      const res = await request(app)
        .get('/cors-proxy')
        .set('Target-URL', targetUrl)
        .set('CustomHeaders', JSON.stringify({ Authorization: basic('josé:DASHY_TEST_BASIC_PASS') }));
      expect(res.status).toBe(200);
      expect(received.authorization).toBe(basic('josé:hunter2'));
    } finally {
      delete process.env.DASHY_TEST_BASIC_PASS;
    }
  });

  it('blocks a redirect to a metadata host (does not follow it)', async () => {
    handler = (req, res) => {
      res.statusCode = 302;
      res.setHeader('location', 'http://169.254.169.254/latest/meta-data/');
      res.end();
    };
    const res = await request(app).get('/cors-proxy').set('Target-URL', targetUrl);
    expect(res.body.error.code).toBe('EBLOCKED');
    expect(res.body.error.message).toContain('blocked');
  });

});

// Verify the request.js → cors-proxy timeout contract end-to-end. The proxy
// classifies via a `timeout: true` marker on the RequestError, not via the
// 'ECONNABORTED' string (which collides with a real libuv errno).
describe('request.js timeout marker', () => {
  const request_ = require('../../services/utils/request');

  let target;
  let targetUrl;
  beforeAll(() => new Promise((resolve) => {
    target = http.createServer(() => { /* never respond */ });
    target.listen(0, '127.0.0.1', () => {
      targetUrl = `http://127.0.0.1:${target.address().port}`;
      resolve();
    });
  }));
  afterAll(() => new Promise((resolve) => target.close(resolve)));

  it('rejects with timeout:true (and ECONNABORTED preserved on .code for back-compat)', async () => {
    await expect(request_({ url: targetUrl, timeout: 50 })).rejects.toMatchObject({
      timeout: true,
      code: 'ECONNABORTED',
    });
  });
});

describe('CORS proxy env-var substitution', () => {
  const SET_KEYS = [];
  const setEnv = (k, v) => { SET_KEYS.push(k); process.env[k] = v; };
  afterEach(() => { while (SET_KEYS.length) delete process.env[SET_KEYS.pop()]; });

  let warnSpy;
  beforeAll(() => { warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterAll(() => { warnSpy.mockRestore(); });

  it('replaces a DASHY_ token with its env value', () => {
    setEnv('DASHY_FOO', 'secret');
    expect(substituteEnv('Bearer DASHY_FOO')).toBe('Bearer secret');
  });

  it('replaces VITE_APP_ and VUE_APP_ tokens (back-compat)', () => {
    setEnv('VITE_APP_KEY', 'abc');
    setEnv('VUE_APP_KEY', 'xyz');
    expect(substituteEnv('VITE_APP_KEY')).toBe('abc');
    expect(substituteEnv('VUE_APP_KEY')).toBe('xyz');
  });

  it('leaves unset placeholders verbatim', () => {
    expect(substituteEnv('Bearer DASHY_NOT_SET')).toBe('Bearer DASHY_NOT_SET');
  });

  it('does not substitute non-prefixed env vars', () => {
    setEnv('AWS_SECRET_KEY', 'should-not-leak');
    expect(substituteEnv('AWS_SECRET_KEY')).toBe('AWS_SECRET_KEY');
  });

  it('replaces multiple placeholders in one string', () => {
    setEnv('DASHY_HOST', 'pi.local');
    setEnv('DASHY_KEY', 'k1');
    expect(substituteEnv('http://DASHY_HOST/api?key=DASHY_KEY')).toBe('http://pi.local/api?key=k1');
  });

  it('walks into objects and arrays', () => {
    setEnv('DASHY_PASS', 'p4ss');
    setEnv('DASHY_USER', 'admin');
    const input = { auth: { user: 'DASHY_USER', pass: 'DASHY_PASS' }, tags: ['DASHY_PASS'] };
    expect(substituteEnv(input)).toEqual({
      auth: { user: 'admin', pass: 'p4ss' },
      tags: ['p4ss'],
    });
  });

  it('passes through non-string, non-object values unchanged', () => {
    expect(substituteEnv(undefined)).toBe(undefined);
    expect(substituteEnv(null)).toBe(null);
    expect(substituteEnv(42)).toBe(42);
    expect(substituteEnv(true)).toBe(true);
  });

  it('substitutes mixed-case suffix (matches process.env case-sensitively)', () => {
    setEnv('VITE_APP_pihole_ip', '10.0.0.1');
    expect(substituteEnv('http://VITE_APP_pihole_ip/api')).toBe('http://10.0.0.1/api');
  });

  it('warns once per unique unset placeholder, then stays quiet', () => {
    warnSpy.mockClear();
    // Use names unlikely to collide with any earlier warnings in this run
    substituteEnv('DASHY_WARN_TEST_ONE');
    substituteEnv('DASHY_WARN_TEST_ONE'); // repeat - should not re-log
    substituteEnv('DASHY_WARN_TEST_TWO');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy.mock.calls[0][0]).toContain('DASHY_WARN_TEST_ONE');
    expect(warnSpy.mock.calls[1][0]).toContain('DASHY_WARN_TEST_TWO');
  });
});

describe('CORS proxy body forwarding', () => {
  let target;
  let targetUrl;
  let received;

  beforeAll(() => new Promise((resolve) => {
    target = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        received = { contentType: req.headers['content-type'], body };
        res.end('{}');
      });
    });
    target.listen(0, '127.0.0.1', () => {
      targetUrl = `http://127.0.0.1:${target.address().port}`;
      resolve();
    });
  }));
  afterAll(() => new Promise((resolve) => target.close(resolve)));

  it('forwards a JSON body to the target', async () => {
    await request(app).post('/cors-proxy')
      .set('Target-URL', targetUrl)
      .set('CustomHeaders', JSON.stringify({ 'Content-Type': 'application/json' }))
      .send({ password: 'hunter2' });
    expect(received.body).toBe('{"password":"hunter2"}');
    expect(received.contentType).toBe('application/json');
  });
});
