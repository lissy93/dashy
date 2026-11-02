// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-header-auth-'));
process.env.USER_DATA_DIR = tmpDir;
fs.writeFileSync(path.join(tmpDir, 'conf.yml'), `pageInfo: { title: Test }
appConfig:
  auth:
    enableHeaderAuth: true
    headerAuth: { proxyWhitelist: ['127.0.0.1'] }
    users:
      - { user: Alicia, hash: ABC123, type: admin }
sections:
  - name: Private
    items:
      - { title: secret-host, url: 'http://10.0.0.5' }
`);

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

const app = require('../../services/app');

describe('Header auth', () => {
  it('accepts users listed in conf.yml, ignoring case', async () => {
    const info = await request(app).get('/system-info').set('Remote-User', 'alicia');
    expect(info.status).toBe(200);
    const conf = await request(app).get('/conf.yml').set('Remote-User', 'alicia');
    expect(conf.text).toContain('secret-host');
  });

  it('treats users missing from conf.yml as signed out', async () => {
    const info = await request(app).get('/system-info').set('Remote-User', 'mallory');
    expect(info.status).toBe(401);
    const conf = await request(app).get('/conf.yml').set('Remote-User', 'mallory');
    expect(conf.status).toBe(200);
    expect(conf.text).toContain('_bootstrap');
    expect(conf.text).not.toContain('secret-host');
  });

  it('rejects requests without the user header', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.status).toBe(401);
  });
});
