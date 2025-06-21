# Desktop Build Guide

## Prerequisites

1. Install Node.js (v18 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```

## Building for Windows

### Option 1: Installer (.exe)
```bash
npm run dist:win
```
This creates:
- `dist-electron/Task App Setup {version}.exe` - Installer

### Option 2: Portable Version
The build also creates:
- `dist-electron/Task App {version}.exe` - Portable executable

## Building for Linux

### All Linux formats:
```bash
npm run dist:linux
```

This creates:
- `dist-electron/Task App-{version}.AppImage` - Universal Linux app
- `dist-electron/task-app_{version}_amd64.deb` - Debian/Ubuntu package
- `dist-electron/task-app-{version}.x86_64.rpm` - Fedora/RHEL package

### Running on Linux:
```bash
# AppImage (most universal)
chmod +x "Task App-{version}.AppImage"
./"Task App-{version}.AppImage"

# Debian/Ubuntu
sudo dpkg -i task-app_{version}_amd64.deb

# Fedora/RHEL
sudo rpm -i task-app-{version}.x86_64.rpm
```

## Building for Both Platforms

```bash
npm run dist:all
```

## Output Location

All builds are saved to the `dist-electron/` directory.

## Notes

- Windows builds create both installer and portable versions
- Linux AppImage is the most portable option
- All builds include the Next.js app bundled with Electron
- Google credentials are stored locally in each platform's storage