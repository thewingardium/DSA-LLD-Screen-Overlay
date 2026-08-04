const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { takeScreenshot } = require('./services/capture');
const { analyzeImage, checkAgyInstallation } = require('./services/ai');
const { readCache, writeCache } = require('./services/cache');

let mainWindow;
let isScrollMode = false;
let captureQueue = [];

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Make the window invisible to screen sharing apps (Zoom, Meet, etc.)
  mainWindow.setContentProtection(true);

  // Make the window ignore all mouse events, passing them through to the apps beneath
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  const cache = readCache();
  if (!cache.isVisible) {
    mainWindow.hide();
  }

  // Check if agy is installed
  checkAgyInstallation().then((isInstalled) => {
    if (!isInstalled) {
      mainWindow.webContents.send('agy-missing');
      mainWindow.show();
    }
  });
}

async function triggerAnalysis(retry = false) {
  if (!mainWindow) return;
  
  // Hide the window so we don't capture the overlay itself
  mainWindow.hide();
  
  // Wait a tiny bit for the window to actually hide
  await new Promise(r => setTimeout(r, 100));

  try {
    let screenshotPaths = [...captureQueue];
    
    // If the queue is empty (or retry), take a single screenshot now
    if (screenshotPaths.length === 0 || retry) {
      const screenshotPath = await takeScreenshot();
      screenshotPaths = [screenshotPath];
    }
    
    // Clear queue after capturing the paths to process
    captureQueue = [];
    
    // Show window again
    mainWindow.show();
    writeCache({ isVisible: true });
    
    // Tell renderer we are loading and clear queue in UI
    mainWindow.webContents.send('analysis-start');
    mainWindow.webContents.send('queue-update', 0);
    
    // Call AI service
    const response = await analyzeImage(screenshotPaths);
    
    writeCache({ lastResponse: response });
    mainWindow.webContents.send('analysis-complete', { response });
  } catch (error) {
    mainWindow.show();
    writeCache({ isVisible: true });
    mainWindow.webContents.send('analysis-error', { error: error.message });
  }
}

app.whenReady().then(() => {
  createWindow();

  // Toggle Visibility
  globalShortcut.register('Control+Option+O', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        writeCache({ isVisible: false });
      } else {
        mainWindow.show();
        writeCache({ isVisible: true });
        
        // Restore last response
        const cache = readCache();
        if (cache.lastResponse) {
          mainWindow.webContents.send('analysis-complete', { response: cache.lastResponse });
        }
      }
    }
  });

  // Trigger Analysis
  globalShortcut.register('Control+Option+A', () => {
    triggerAnalysis(false);
  });

  // Queue Screenshot
  globalShortcut.register('Control+Option+C', async () => {
    if (!mainWindow) return;
    mainWindow.hide();
    await new Promise(r => setTimeout(r, 100));
    try {
      const filename = `dsa_overlay_capture_${Date.now()}.png`;
      const screenshotPath = await takeScreenshot(filename);
      captureQueue.push(screenshotPath);
      mainWindow.show();
      mainWindow.webContents.send('queue-update', captureQueue.length);
    } catch (e) {
      console.error('Queue capture failed', e);
      mainWindow.show();
    }
  });

  // Retry Analysis
  globalShortcut.register('Control+Option+R', () => {
    triggerAnalysis(true);
  });

  // Toggle Scroll Mode
  globalShortcut.register('Control+Option+S', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      isScrollMode = !isScrollMode;
      if (isScrollMode) {
        mainWindow.setIgnoreMouseEvents(false);
        mainWindow.focus();
        mainWindow.webContents.send('scroll-mode', true);
      } else {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        mainWindow.webContents.send('scroll-mode', false);
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler to get initial cache
ipcMain.handle('get-cache', () => {
  return readCache();
});
