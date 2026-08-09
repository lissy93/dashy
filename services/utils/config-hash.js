/**
 * Hashing helpers for config files, used for optimistic concurrency control.
 * Both the YAML-serving middleware and the save endpoint hash through here,
 * so they can never disagree on algorithm or encoding.
 */
const crypto = require('crypto');
const fs = require('fs');

const fsPromises = fs.promises;

/* Returns the SHA-256 of a string, as lowercase hex */
const hashString = (contents) => crypto.createHash('sha256').update(contents, 'utf8').digest('hex');

/* Synchronously hashes a file, returning null if it can't be read */
const hashFileSync = (filePath) => {
  try {
    return hashString(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
};

/* Reads a file and returns its hash, contents and mtime. Null if it doesn't exist */
const readFileMeta = async (filePath) => {
  let contents;
  try {
    contents = await fsPromises.readFile(filePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
  const { mtimeMs } = await fsPromises.stat(filePath);
  return { hash: hashString(contents), contents, mtimeMs };
};

module.exports = { hashString, hashFileSync, readFileMeta };
