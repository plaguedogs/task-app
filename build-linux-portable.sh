#!/bin/bash

# Build script for portable Linux package
set -e

echo "Building portable Linux package..."

# Clean previous builds
rm -rf dist-linux
rm -f task-app-linux-portable.tar.gz

# Create directory structure
mkdir -p dist-linux/task-app

# Build the Next.js app
echo "Building Next.js app..."
npm run build

# Copy necessary files
echo "Copying files..."
cp -r .next dist-linux/task-app/
cp -r public dist-linux/task-app/
cp -r node_modules dist-linux/task-app/
cp package.json dist-linux/task-app/
cp package-lock.json dist-linux/task-app/
cp next.config.mjs dist-linux/task-app/
cp server.js dist-linux/task-app/
cp -r app dist-linux/task-app/
cp -r components dist-linux/task-app/
cp -r contexts dist-linux/task-app/
cp -r hooks dist-linux/task-app/
cp -r lib dist-linux/task-app/
cp -r prompts dist-linux/task-app/
cp -r styles dist-linux/task-app/
cp components.json dist-linux/task-app/
cp postcss.config.mjs dist-linux/task-app/
cp tailwind.config.ts dist-linux/task-app/
cp tsconfig.json dist-linux/task-app/

# Create launcher scripts
cat > dist-linux/task-app/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Start the production server
echo "Starting Task App..."
NODE_ENV=production node server.js
EOF

cat > dist-linux/task-app/start-dev.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Start the development server
echo "Starting Task App in development mode..."
npm run dev
EOF

cat > dist-linux/task-app/start-browser.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Start the server in background
./start.sh &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Open in default browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:3001
elif command -v firefox &> /dev/null; then
    firefox http://localhost:3001
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:3001
else
    echo "Could not detect a browser. Please open http://localhost:3001 manually."
fi

# Keep the script running
echo "Server is running. Press Ctrl+C to stop."
wait $SERVER_PID
EOF

# Make scripts executable
chmod +x dist-linux/task-app/*.sh

# Create README
cat > dist-linux/task-app/README.txt << 'EOF'
Task App - Portable Linux Version
=================================

Requirements:
- Node.js 18 or higher
- A modern web browser

How to run:
1. Extract this archive to any location
2. Open a terminal in the extracted folder
3. Run one of the following:
   - ./start.sh - Start the production server
   - ./start-browser.sh - Start server and open in browser
   - ./start-dev.sh - Start in development mode

The app will be available at http://localhost:3001

To stop the server, press Ctrl+C in the terminal.

Notes:
- Your settings and data are stored in your browser's localStorage
- Make sure port 3001 is not in use by another application
EOF

# Create the archive
echo "Creating portable archive..."
cd dist-linux
tar -czf ../task-app-linux-portable.tar.gz task-app

cd ..
echo "Build complete! File created: task-app-linux-portable.tar.gz"
echo "Extract and run ./start.sh or ./start-browser.sh"