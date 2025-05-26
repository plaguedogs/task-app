#!/bin/bash

echo "Starting Task App (Standalone Build)..."
echo

cd "$(dirname "$0")"

if [ -d ".next/standalone" ]; then
    echo "Running standalone server..."
    cd .next/standalone
    node server.js
else
    echo "Standalone build not found. Building now..."
    npm run build
    echo
    echo "Build complete. Running server..."
    cd .next/standalone
    node server.js
fi