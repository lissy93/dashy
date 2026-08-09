// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';

const { hashString } = require('../../services/utils/config-hash');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-conflict-'));
process.env.USER_DATA_DIR = tmpDir;
process.env.DISABLE_CONFIG_BACKUPS = 'true';
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

const app = require('../../services/app');
const save = (body) => request(app).post('/config-manager/save').send(body);
const confPath = path.join(tmpDir, 'conf.yml');
const ORIGINAL = 'pageInfo:\n  title: Original\nsections: []\n';
const MINE = 'pageInfo:\n  title: Mine\nsections: []\n';
const THEIRS = 'pageInfo:\n  title: Theirs\nsections: []\n';

beforeEach(() => fs.writeFileSync(confPath, ORIGINAL));

describe('Save config conflict detection', () => {
  it('writes when the hash matches', async () => {
    const res = await save({ config: MINE, baseHash: hashString(ORIGINAL) });
    const body = JSON.parse(res.text);
    expect(body.success).toBe(true);
    expect(fs.readFileSync(confPath, 'utf8')).toBe(MINE);
  });

  it('returns newHash on success, matching the written bytes', async () => {
    const res = await save({ config: MINE, baseHash: hashString(ORIGINAL) });
    expect(JSON.parse(res.text).newHash).toBe(hashString(MINE));
  });

  it('refuses to write when the file changed underneath', async () => {
    const staleHash = hashString(ORIGINAL);
    fs.writeFileSync(confPath, THEIRS); // someone else saved first
    const res = await save({ config: MINE, baseHash: staleHash });
    const body = JSON.parse(res.text);
    expect(body.success).toBe(false);
    expect(body.conflict).toBe(true);
    expect(fs.readFileSync(confPath, 'utf8')).toBe(THEIRS); // unchanged
  });

  it('returns the on-disk content so the client can diff it', async () => {
    const staleHash = hashString(ORIGINAL);
    fs.writeFileSync(confPath, THEIRS);
    const body = JSON.parse((await save({ config: MINE, baseHash: staleHash })).text);
    expect(body.currentConfig).toBe(THEIRS);
    expect(body.currentHash).toBe(hashString(THEIRS));
    expect(typeof body.currentMtime).toBe('number');
  });

  it('writes anyway when force is true', async () => {
    const staleHash = hashString(ORIGINAL);
    fs.writeFileSync(confPath, THEIRS);
    const res = await save({ config: MINE, baseHash: staleHash, force: true });
    expect(JSON.parse(res.text).success).toBe(true);
    expect(fs.readFileSync(confPath, 'utf8')).toBe(MINE);
  });

  it('fails open when baseHash is absent', async () => {
    fs.writeFileSync(confPath, THEIRS);
    const res = await save({ config: MINE });
    expect(JSON.parse(res.text).success).toBe(true);
    expect(fs.readFileSync(confPath, 'utf8')).toBe(MINE);
  });

  it('treats a missing target file as no conflict', async () => {
    fs.rmSync(confPath);
    const res = await save({ config: MINE, baseHash: hashString(ORIGINAL) });
    expect(JSON.parse(res.text).success).toBe(true);
  });

  it('detects conflicts on sub-page configs too', async () => {
    const subPath = path.join(tmpDir, 'sub.yml');
    fs.writeFileSync(subPath, ORIGINAL);
    const staleHash = hashString(ORIGINAL);
    fs.writeFileSync(subPath, THEIRS);
    const res = await save({ config: MINE, filename: 'sub.yml', baseHash: staleHash });
    expect(JSON.parse(res.text).conflict).toBe(true);
    expect(fs.readFileSync(subPath, 'utf8')).toBe(THEIRS);
  });

  it('stays invisible for a non-stale editor across consecutive saves', async () => {
    // First save from a current page
    const first = JSON.parse((await save({ config: MINE, baseHash: hashString(ORIGINAL) })).text);
    expect(first.success).toBe(true);
    expect(first.conflict).toBeUndefined();

    // Second save using the hash the first save returned - must not conflict
    const second = JSON.parse((await save({ config: THEIRS, baseHash: first.newHash })).text);
    expect(second.success).toBe(true);
    expect(second.conflict).toBeUndefined();
    expect(fs.readFileSync(confPath, 'utf8')).toBe(THEIRS);
  });

  it('does not create a backup when a write is refused', async () => {
    process.env.DISABLE_CONFIG_BACKUPS = 'false';
    try {
      const backupDir = path.join(tmpDir, 'config-backups');
      const before = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).length : 0;
      const staleHash = hashString(ORIGINAL);
      fs.writeFileSync(confPath, THEIRS);
      await save({ config: MINE, baseHash: staleHash });
      const after = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).length : 0;
      expect(after).toBe(before);
    } finally {
      process.env.DISABLE_CONFIG_BACKUPS = 'true';
    }
  });
});
