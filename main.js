const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let fileWatcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Birthday Letter Generator",
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (fileWatcher) {
      fileWatcher.close();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('select-csv', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Friends CSV File',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content };
  } catch (error) {
    console.error('Error reading CSV:', error);
    throw error;
  }
});

ipcMain.handle('create-csv', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Create New Friends CSV File',
    defaultPath: path.join(app.getPath('documents'), 'friends.csv'),
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const filePath = result.filePath;
  const header = '\uFEFF이름,나이,생일,연락처,나와 처음 만난 곳,알고 지낸 기간,특이사항\n';
  try {
    fs.writeFileSync(filePath, header, 'utf-8');
    return { filePath, content: header };
  } catch (error) {
    console.error('Error creating CSV:', error);
    throw error;
  }
});

ipcMain.handle('read-csv', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading CSV:', error);
    throw error;
  }
});

ipcMain.handle('write-csv', async (event, { filePath, content }) => {
  try {
    // Write with BOM for Excel compatibility
    const hasBOM = content.startsWith('\uFEFF');
    const contentToWrite = hasBOM ? content : '\uFEFF' + content;
    fs.writeFileSync(filePath, contentToWrite, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing CSV:', error);
    throw error;
  }
});

ipcMain.handle('watch-csv', (event, filePath) => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }

  if (!filePath) return;

  try {
    let watchTimeout = null;
    fileWatcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        // Debounce watch events because some editors trigger multiple changes
        if (watchTimeout) clearTimeout(watchTimeout);
        watchTimeout = setTimeout(() => {
          if (mainWindow) {
            mainWindow.webContents.send('csv-changed', filePath);
          }
        }, 100);
      }
    });
  } catch (error) {
    console.error('Error setting up file watcher:', error);
  }
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  clipboard.writeText(text);
  return true;
});
