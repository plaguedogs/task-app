#!/bin/bash

echo "🚀 Starting Task App..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "   Your Google Sheets integration won't work without it."
    echo ""
fi

# Kill any existing process on port 3000
echo "🔍 Checking port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Cleared port 3000" || echo "✅ Port 3000 is free"

echo ""
echo "🌐 Starting server..."
echo "📍 App will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"
echo ""

# Start the development server
npm run dev