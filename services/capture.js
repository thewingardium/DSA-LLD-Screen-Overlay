const path = require('path');
const os = require('os');
const screenshot = require('screenshot-desktop');

function takeScreenshot(filename = 'dsa_overlay_capture.png') {
  return new Promise((resolve, reject) => {
    const screenshotPath = path.join(os.tmpdir(), filename);
    
    screenshot({ filename: screenshotPath })
      .then((imgPath) => resolve(imgPath))
      .catch((err) => {
        console.error('Error taking screenshot:', err);
        reject(err);
      });
  });
}

module.exports = {
  takeScreenshot
};
