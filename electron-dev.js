const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'public/placeholder-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // In development, start Next.js dev server
  console.log('Starting Next.js development server...');
  
  nextProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    env: { ...process.env, PORT: '3000' },
    cwd: __dirname
  });

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });

  // Wait for Next.js to start
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 5000);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (nextProcess) {
      nextProcess.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});