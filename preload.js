const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onAnalysisStart: (callback) => ipcRenderer.on('analysis-start', callback),
  onAnalysisComplete: (callback) => ipcRenderer.on('analysis-complete', (event, data) => callback(data)),
  onAnalysisError: (callback) => ipcRenderer.on('analysis-error', (event, data) => callback(data)),
  onScrollMode: (callback) => ipcRenderer.on('scroll-mode', (event, isScrollMode) => callback(isScrollMode)),
  onQueueUpdate: (callback) => ipcRenderer.on('queue-update', (event, count) => callback(count)),
  onAgyMissing: (callback) => ipcRenderer.on('agy-missing', callback),
  getCache: () => ipcRenderer.invoke('get-cache'),
});
