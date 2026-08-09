/**
 * This file exports a function, used by the write config endpoint.
 * It will make a backup of the users conf.yml file
 * and then write their new config into the main conf.yml file.
 * Finally, it will call a function with the status message
 */
const fsPromises = require('fs').promises;
const path = require('path');
const { hashString, readFileMeta } = require('../utils/config-hash');

const MAX_CONFIG_BYTES = 256 * 1024;

// Disallow paths having path separators, control chars (NUL/CR/LF), or ..
const SAFE_FILENAME = /^(?!\.+$)[^\\/\0\r\n]+\.ya?ml$/i;

module.exports = async (newConfig, render) => {
  const respond = (success, message, extra) => render(
    JSON.stringify({ success, message, ...(extra || {}) }),
  );

  // Validate request body
  if (!newConfig || typeof newConfig.config !== 'string' || newConfig.config.length === 0) {
    respond(false, "Request body is missing or has an invalid 'config' field");
    return;
  }
  if (newConfig.config.length > MAX_CONFIG_BYTES) {
    respond(false, `Config exceeds maximum size of ${MAX_CONFIG_BYTES / 1024} KB`);
    return;
  }

  // If `filename` (for sub-pages) is specified validate and set it
  let usersFileName;
  if (typeof newConfig.filename === 'string' && newConfig.filename) {
    const base = path.basename(newConfig.filename);
    if (!SAFE_FILENAME.test(base)) {
      respond(false, 'Invalid filename: must be a basename ending in .yml or .yaml');
      return;
    }
    usersFileName = base;
  }

  // Resolve paths
  const userDataDirectory = process.env.USER_DATA_DIR || './user-data/';
  const backupLocation = process.env.BACKUP_DIR || path.join(userDataDirectory, 'config-backups');
  const backupsEnabled = process.env.DISABLE_CONFIG_BACKUPS !== 'true';
  const targetFile = usersFileName || 'conf.yml';
  const targetFilePath = path.join(userDataDirectory, targetFile);

  const backupBase = targetFile.replace(/\.ya?ml$/i, '');
  const backupFilePath = path.join(backupLocation, `${backupBase}-${Date.now()}.backup.yml`);

  // Optimistic concurrency: if the caller told us which version they started
  // from, refuse to write when the file has moved on since. Absent baseHash
  // means an older client or the REST API, so we fail open and write as usual.
  if (typeof newConfig.baseHash === 'string' && newConfig.baseHash && newConfig.force !== true) {
    let current;
    try {
      current = await readFileMeta(targetFilePath);
    } catch (error) {
      respond(false, `Unable to read ${targetFile} to check for conflicts: ${error}`);
      return;
    }
    if (current && current.hash !== newConfig.baseHash) {
      respond(false, 'Config was modified by someone else since this page was loaded', {
        conflict: true,
        currentConfig: current.contents,
        currentHash: current.hash,
        currentMtime: current.mtimeMs,
      });
      return;
    }
  }

  // Backup current config before proceeding (unless disabled via DISABLE_CONFIG_BACKUPS)
  let backedUp = false;
  if (backupsEnabled) {
    try {
      await fsPromises.mkdir(backupLocation, { recursive: true });
      await fsPromises.copyFile(targetFilePath, backupFilePath);
      backedUp = true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        respond(false, `Unable to backup ${targetFile}: ${error}`);
        return;
      }
    }
  }

  // Write the new config
  try {
    await fsPromises.writeFile(targetFilePath, newConfig.config, { encoding: 'utf8' });
  } catch (error) {
    respond(false, `Unable to write to ${targetFile}: ${error}`);
    return;
  }

  // If successful, then render hasn't yet been called- call it
  let responseMsg = `Config saved successfully in ${targetFilePath}.`;
  if (backedUp) {
    responseMsg += ` Previous ${targetFile} was backed up to ${backupFilePath}.`;
  }
  respond(true, responseMsg, { newHash: hashString(newConfig.config) });
};
