const { exec } = require('child_process');
const net = require('net');
const path = require('path');

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

// Main function
async function main() {
  console.log('🚀 Task App Launcher');
  console.log('='.repeat(40));
  
  const port = await findPort();
  
  if (!port) {
    console.error('❌ No available ports found!');
    process.exit(1);
  }
  
  console.log(`✅ Using port: ${port}`);
  console.log(`🌐 Open http://localhost:${port} in your browser`);
  console.log('='.repeat(40));
  console.log('Press Ctrl+C to stop\n');
  
  // Set environment
  process.env.PORT = port;
  
  // Run the development server
  const child = exec(`npx next dev -p ${port}`, {
    cwd: __dirname,
    env: process.env
  });
  
  // Pipe output
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  // Handle exit
  child.on('exit', (code) => {
    console.log(`\n👋 Server stopped with code ${code}`);
    process.exit(code);
  });
}

// Run
main().catch(console.error);