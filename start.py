#!/usr/bin/env python3
"""Simple HTTP server to serve the Next.js build"""
import http.server
import socketserver
import os
import webbrowser
import socket

def find_free_port(start=3000, end=3010):
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('', port))
                return port
            except:
                continue
    return 8000

# Change to the build directory
if os.path.exists('.next'):
    print("🚀 Starting Task App (Static Server)")
    print("=" * 40)
    
    PORT = find_free_port()
    
    # Simple HTTP server
    os.chdir('.')
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    print(f"✅ Server starting on port {PORT}")
    print(f"🌐 Open http://localhost:{PORT} in your browser")
    print("=" * 40)
    print("Press Ctrl+C to stop\n")
    
    # Open browser
    webbrowser.open(f'http://localhost:{PORT}')
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
else:
    print("❌ Build directory not found. Run 'npm run build' first!")