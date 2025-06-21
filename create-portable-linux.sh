#!/bin/bash

# Quick portable Linux package creator
set -e

echo "Creating portable Linux package..."

# Clean previous builds
rm -rf task-app-linux
rm -f task-app-linux.tar.gz

# Create directory
mkdir -p task-app-linux

# Copy all necessary files
echo "Copying files..."
cp -r app task-app-linux/
cp -r components task-app-linux/
cp -r contexts task-app-linux/
cp -r hooks task-app-linux/
cp -r lib task-app-linux/
cp -r prompts task-app-linux/
cp -r public task-app-linux/
cp -r styles task-app-linux/
cp *.json task-app-linux/
cp *.mjs task-app-linux/
cp *.ts task-app-linux/
cp server.js task-app-linux/

# Create simple launcher scripts
cat > task-app-linux/install-deps.sh << 'EOF'
#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Dependencies installed!"
EOF

cat > task-app-linux/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Running install..."
    ./install-deps.sh
fi

# Start production server
echo "Starting Task App..."
npm run build && NODE_ENV=production node server.js
EOF

cat > task-app-linux/start-dev.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Running install..."
    ./install-deps.sh
fi

# Start dev server
npm run dev
EOF

cat > task-app-linux/start-quick.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Running install..."
    ./install-deps.sh
fi

# Quick start with existing build
if [ -d ".next" ]; then
    echo "Starting with existing build..."
    NODE_ENV=production node server.js
else
    echo "No build found. Building first..."
    npm run build && NODE_ENV=production node server.js
fi
EOF

cat > task-app-linux/START-HERE.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "==================================="
echo "    Task App - Linux Portable"
echo "==================================="
echo ""
echo "First time setup..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js 18 or higher:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  Or visit: https://nodejs.org/"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies (first time only)..."
    npm install
    echo ""
fi

# Build if needed
if [ ! -d ".next" ]; then
    echo "Building app (first time only)..."
    npm run build
    echo ""
fi

# Start the app
echo "Starting Task App..."
echo "Opening http://localhost:3001 in your browser..."
echo ""

# Start server and open browser
NODE_ENV=production node server.js &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
elif command -v firefox &> /dev/null; then
    firefox http://localhost:3001
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:3001
else
    echo "Please open http://localhost:3001 in your browser"
fi

echo ""
echo "Server is running. Press Ctrl+C to stop."
wait $SERVER_PID
EOF

# Make all scripts executable
chmod +x task-app-linux/*.sh

# Create README
cat > task-app-linux/README.md << 'EOF'
# Task App - Linux Portable

## Quick Start
1. Make sure Node.js 18+ is installed
2. Run: `./START-HERE.sh`
3. App opens at http://localhost:3001

## Requirements
- Node.js 18 or higher
- npm (comes with Node.js)

## Install Node.js (if needed)
```bash
# Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm

# Fedora:
sudo dnf install nodejs npm

# Arch:
sudo pacman -S nodejs npm
```

## Available Scripts
- `./START-HERE.sh` - First time setup and run (recommended)
- `./start.sh` - Build and start production server
- `./start-dev.sh` - Start development server
- `./start-quick.sh` - Start with existing build
- `./install-deps.sh` - Install dependencies only

## Notes
- Settings are stored in your browser
- Default port is 3001
- Press Ctrl+C to stop the server
EOF

# Create the archive
echo "Creating archive..."
tar -czf task-app-linux.tar.gz task-app-linux

echo ""
echo "✅ Success! Created: task-app-linux.tar.gz"
echo ""
echo "To use:"
echo "1. Copy task-app-linux.tar.gz to Ubuntu machine"
echo "2. Extract: tar -xzf task-app-linux.tar.gz"
echo "3. Run: cd task-app-linux && ./START-HERE.sh"
echo ""
echo "That's it! No installation needed, just Node.js."