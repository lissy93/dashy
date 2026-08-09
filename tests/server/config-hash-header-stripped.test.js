// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';
import request from 'supertest';

const { hashString } = require('../../services/utils/config-hash');

// Full config with auth configured (so bootstrap-strip path is taken)
const FULL_CONF_WITH_AUTH = `appConfig:
  enableServiceWorker: true
  theme: dark
  customCss: '.secret { color: red }'
  auth:
    enableOidc: true
    oidc:
      endpoint: https://example.test/
      clientId: dashy-test
      adminGroup: admins
pageInfo:
  title: My Dashboard
sections:
  - name: Internal Services
    items:
      - title: secret-host
        url: http://10.0.0.5
`;

let app;
let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-hash-stripped-'));
  fs.writeFileSync(path.join(tmpDir, 'conf.yml'), FULL_CONF_WITH_AUTH);
  process.env.USER_DATA_DIR = tmpDir;
  // Must delete cache to force re-require with new env var so auth is detected
  delete require.cache[require.resolve('../../services/app')];
  delete require.cache[require.resolve('../../services/utils/auth-oidc')];
  app = require('../../services/app');
});

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

describe('X-Config-Hash header with auth-configured bootstrap-strip', () => {
  it('returns full-file hash even when body is stripped for unauthenticated request', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.status).toBe(200);

    // The header must equal the hash of the FULL original file on disk
    const fullFileHash = hashString(FULL_CONF_WITH_AUTH);
    expect(res.headers['x-config-hash']).toBe(fullFileHash);
  });

  it('verifies that the stripped body differs from the full file', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.status).toBe(200);

    // Parse the response body to verify it was actually stripped
    const strippedBody = yamlLoad(res.text);

    // Verify we got the stripped response (has _bootstrap, no sections, no customCss)
    expect(strippedBody._bootstrap).toBeDefined();
    expect(strippedBody._bootstrap.authenticated).toBe(false);
    expect(strippedBody.sections).toBeUndefined();
    expect(strippedBody.appConfig.customCss).toBeUndefined();

    // The stripped body should NOT be the same as the original
    expect(res.text).not.toBe(FULL_CONF_WITH_AUTH);
  });

  it('confirms the header is exposed for CORS reads', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.headers['access-control-expose-headers']).toContain('X-Config-Hash');
  });
});
