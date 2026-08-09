// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';

const { hashString } = require('../../services/utils/config-hash');

const CONF = 'pageInfo:\n  title: Hash Test\nsections: []\n';
let app;
let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-hash-header-'));
  fs.writeFileSync(path.join(tmpDir, 'conf.yml'), CONF);
  fs.writeFileSync(path.join(tmpDir, 'sub.yml'), 'pageInfo:\n  title: Sub\n');
  process.env.USER_DATA_DIR = tmpDir;
  app = require('../../services/app');
});
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

describe('X-Config-Hash header', () => {
  it('is set on the root config, matching the file contents', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.headers['x-config-hash']).toBe(hashString(CONF));
  });

  it('is set on sub-page configs', async () => {
    const res = await request(app).get('/sub.yml');
    expect(res.headers['x-config-hash']).toBe(hashString('pageInfo:\n  title: Sub\n'));
  });

  it('is exposed to cross-origin readers', async () => {
    const res = await request(app).get('/conf.yml');
    expect(res.headers['access-control-expose-headers']).toContain('X-Config-Hash');
  });

  it('changes when the file changes', async () => {
    const before = (await request(app).get('/conf.yml')).headers['x-config-hash'];
    fs.writeFileSync(path.join(tmpDir, 'conf.yml'), `${CONF}# edited\n`);
    const after = (await request(app).get('/conf.yml')).headers['x-config-hash'];
    expect(after).not.toBe(before);
    fs.writeFileSync(path.join(tmpDir, 'conf.yml'), CONF);
  });

  it('omits the header rather than erroring for a missing file', async () => {
    const res = await request(app).get('/does-not-exist.yml');
    expect(res.headers['x-config-hash']).toBeUndefined();
    expect(res.status).toBe(404);
  });
});
