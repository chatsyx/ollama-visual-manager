const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 尝试不同的路径来找到index.html
    const paths = [
      path.join(__dirname, 'build', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(__dirname, 'index.html')
    ];
    
    // 找到第一个存在的路径
    let foundPath = null;
    for (const p of paths) {
      try {
        if (require('fs').existsSync(p)) {
          foundPath = p;
          break;
        }
      } catch (e) {
        console.error('Error checking path:', e);
      }
    }
    
    if (foundPath) {
      mainWindow.loadFile(foundPath);
    } else {
      // 如果找不到index.html，显示错误信息
      mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <html>
          <head>
            <title>Error</title>
          </head>
          <body>
            <h1>Error: Could not find index.html</h1>
            <p>Current directory: ${__dirname}</p>
            <p>Please check if the application is properly packaged.</p>
          </body>
        </html>
      `));
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});