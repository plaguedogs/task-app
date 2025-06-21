#!/bin/bash

# Build script for AppImage
set -e

echo "Building AppImage..."

# Install AppImage tools if not present
if ! command -v appimagetool &> /dev/null; then
    echo "Downloading appimagetool..."
    wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
    chmod +x appimagetool-x86_64.AppImage
    sudo mv appimagetool-x86_64.AppImage /usr/local/bin/appimagetool
fi

# Clean previous builds
rm -rf AppDir
rm -f TaskApp-x86_64.AppImage

# Create AppDir structure
mkdir -p AppDir/usr/bin
mkdir -p AppDir/usr/share/applications
mkdir -p AppDir/usr/share/icons/hicolor/256x256/apps

# Build the app
echo "Building Next.js app..."
npm run build

# Copy app files
cp -r .next AppDir/usr/bin/
cp -r public AppDir/usr/bin/
cp -r node_modules AppDir/usr/bin/
cp package.json AppDir/usr/bin/
cp package-lock.json AppDir/usr/bin/
cp next.config.mjs AppDir/usr/bin/
cp server.js AppDir/usr/bin/
cp -r app AppDir/usr/bin/
cp -r components AppDir/usr/bin/
cp -r contexts AppDir/usr/bin/
cp -r hooks AppDir/usr/bin/
cp -r lib AppDir/usr/bin/
cp -r prompts AppDir/usr/bin/
cp -r styles AppDir/usr/bin/
cp components.json AppDir/usr/bin/
cp postcss.config.mjs AppDir/usr/bin/
cp tailwind.config.ts AppDir/usr/bin/
cp tsconfig.json AppDir/usr/bin/

# Create run script
cat > AppDir/usr/bin/task-app << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Use bundled Node.js if available, otherwise system Node.js
if [ -f "$SCRIPT_DIR/node" ]; then
    NODE_BIN="$SCRIPT_DIR/node"
else
    NODE_BIN="node"
fi

# Check if Node.js is available
if ! command -v "$NODE_BIN" &> /dev/null; then
    zenity --error --text="Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Start the server
NODE_ENV=production "$NODE_BIN" server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Open in default browser
xdg-open http://localhost:3001

# Keep running until server stops
wait $SERVER_PID
EOF

chmod +x AppDir/usr/bin/task-app

# Create desktop entry
cat > AppDir/usr/share/applications/task-app.desktop << 'EOF'
[Desktop Entry]
Name=Task App
Comment=Task management with Google Sheets integration
Exec=task-app
Icon=task-app
Type=Application
Categories=Office;ProjectManagement;
EOF

# Create AppRun
cat > AppDir/AppRun << 'EOF'
#!/bin/bash
APPDIR="$(dirname "$(readlink -f "${0}")")"
exec "$APPDIR/usr/bin/task-app" "$@"
EOF

chmod +x AppDir/AppRun

# Copy icon (using the existing app icon)
cp public/app-icon.svg AppDir/usr/share/icons/hicolor/256x256/apps/task-app.svg
cp public/app-icon.svg AppDir/task-app.svg

# Create AppImage
echo "Creating AppImage..."
ARCH=x86_64 appimagetool AppDir TaskApp-x86_64.AppImage

echo "AppImage created: TaskApp-x86_64.AppImage"
echo "Just download and run - no installation needed!"