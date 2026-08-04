const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_FILE = path.join(os.homedir(), '.dsa_helper_cache.json');

function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return { lastResponse: '', isVisible: false };
}

function writeCache(data) {
  try {
    const currentCache = readCache();
    const newCache = { ...currentCache, ...data };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newCache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

module.exports = {
  readCache,
  writeCache,
};
