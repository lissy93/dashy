// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

const { hashString, hashFileSync, readFileMeta } = require('../../services/utils/config-hash');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashy-hash-'));
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

describe('config-hash', () => {
  it('hashes a string to 64 hex chars', () => {
    expect(hashString('pageInfo:\n  title: Test\n')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is stable for identical input', () => {
    expect(hashString('a: 1')).toBe(hashString('a: 1'));
  });

  it('differs for different input', () => {
    expect(hashString('a: 1')).not.toBe(hashString('a: 2'));
  });

  it('hashFileSync matches hashString of the file contents', () => {
    const file = path.join(tmpDir, 'conf.yml');
    fs.writeFileSync(file, 'a: 1\n');
    expect(hashFileSync(file)).toBe(hashString('a: 1\n'));
  });

  it('hashFileSync returns null for a missing file', () => {
    expect(hashFileSync(path.join(tmpDir, 'nope.yml'))).toBe(null);
  });

  it('readFileMeta returns hash, contents and mtime', async () => {
    const file = path.join(tmpDir, 'meta.yml');
    fs.writeFileSync(file, 'b: 2\n');
    const meta = await readFileMeta(file);
    expect(meta.hash).toBe(hashString('b: 2\n'));
    expect(meta.contents).toBe('b: 2\n');
    expect(typeof meta.mtimeMs).toBe('number');
  });

  it('readFileMeta returns null for a missing file', async () => {
    expect(await readFileMeta(path.join(tmpDir, 'nope.yml'))).toBe(null);
  });
});
