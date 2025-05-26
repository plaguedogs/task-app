# Task App Launcher (PowerShell)
$host.UI.RawUI.WindowTitle = "Task App"

# Change to script directory
Set-Location $PSScriptRoot

# Check if build exists
if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Host "Building app for first time..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
}

# Find available port
$port = 3000
$tcpConnections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
if ($tcpConnections | Where-Object {$_.LocalPort -eq 3000}) {
    $port = 3001
}

Write-Host "Starting Task App on port $port..." -ForegroundColor Green

# Open browser
Start-Process "http://localhost:$port"

# Start server
$env:PORT = $port
npm start