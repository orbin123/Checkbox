const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let store;

async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store({
    name: 'checkbox-data',
    defaults: {
      appData: null,
    },
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: 'Checkbox',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f3f0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In dev mode, load from Vite dev server; in prod, load built files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initStore();

  // IPC handlers for electron-store
  ipcMain.handle('store-get', (_, key) => {
    return store.get(key);
  });

  ipcMain.handle('store-set', (_, key, value) => {
    store.set(key, value);
  });

  createWindow();

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
