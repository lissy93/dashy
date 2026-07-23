// @vitest-environment node
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { describe, it, expect } from 'vitest';
import request from 'supertest';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-status-test-'));
process.env.USER_DATA_DIR = tmpDir;

const app = require('../../services/app');

describe('Status check', () => {
  it('returns error for missing URL param', async () => {
    const res = await request(app).get('/status-check/');
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(false);
  });

  it('returns error for empty URL param', async () => {
    const res = await request(app).get('/status-check/?&url=');
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(false);
  });

  it('ignores POST requests', async () => {
    const res = await request(app).post('/status-check/?&url=x');
    expect(res.status).toBeLessThan(500);
  });

  it('resolves the url param when invoked via the mounted route', async () => {
    // The route handler passes Express's mount-relative req.url ('/?url=...'),
    // so the url param must still be found despite the leading path segment
    const target = http.createServer((req, res) => { res.end('ok'); });
    await new Promise((resolve) => { target.listen(0, '127.0.0.1', resolve); });
    const targetUrl = encodeURIComponent(`http://127.0.0.1:${target.address().port}/`);
    const res = await request(app).get(`/status-check/?url=${targetUrl}`);
    await new Promise((resolve) => { target.close(resolve); });
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(true);
    expect(body.statusCode).toBe(200);
  });
});

describe('Ping check', () => {
  it('returns error for missing URL param', async () => {
    const res = await request(app).get('/ping-check/');
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(false);
  });

  it('returns error for empty URL param', async () => {
    const res = await request(app).get('/ping-check/?&host=');
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(false);
  });

  it('ignores POST requests', async () => {
    const res = await request(app).post('/ping-check/?&host=localhost');
    expect(res.status).toBeLessThan(500);
  });

  it('resolves the host param when invoked via the mounted route', async () => {
    // Same mount-relative req.url shape as the status check above
    const res = await request(app).get('/ping-check/?host=127.0.0.1&count=1');
    const body = JSON.parse(res.text);
    expect(body.successStatus).toBe(true);
  });
});
