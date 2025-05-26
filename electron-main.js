const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let nextProcess;

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find available port
async function findPort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

// Start Next.js server
async function startNextServer() {
  const port = await findPort();
  
  if (!port) {
    console.error('No available ports found!');
    app.quit();
    return;
  }

  console.log(`Starting Next.js server on port ${port}...`);
  
  // Start Next.js in production mode
  nextProcess = spawn('node', ['.next/standalone/server.js'], {
    env: { ...process.env, PORT: port.toString() },
    cwd: app.getAppPath()
  });

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });

  // Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return port;
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'public/placeholder-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the Next.js app
  mainWindow.loadURL(`http://localhost:${port}`);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const port = await startNextServer();
  if (port) {
    createWindow(port);
  }
});

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    const port = await startNextServer();
    if (port) {
      createWindow(port);
    }
  }
});