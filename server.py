#!/usr/bin/env python3
import subprocess
import socket
import sys
import os
import time

def find_free_port(start_port=3000, max_port=3010):
    """Find a free port to use"""
    for port in range(start_port, max_port + 1):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('', port))
            sock.close()
            return port
        except:
            continue
    return None

def main():
    print("🚀 Task App Launcher")
    print("=" * 40)
    
    # Find available port
    port = find_free_port()
    if not port:
        print("❌ No available ports found (3000-3010)")
        sys.exit(1)
    
    print(f"✅ Found available port: {port}")
    print(f"🌐 Opening http://localhost:{port}")
    print("=" * 40)
    print("Press Ctrl+C to stop the server")
    print("")
    
    # Set environment variables
    env = os.environ.copy()
    env['PORT'] = str(port)
    
    # Try to open browser (Windows)
    if sys.platform == 'win32':
        os.system(f'start http://localhost:{port}')
    
    try:
        # Run the dev server
        subprocess.run(['npm', 'run', 'dev', '--', '--port', str(port)], env=env)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTrying alternative method...")
        subprocess.run(['npx', 'next', 'dev', '--port', str(port)], env=env)

if __name__ == '__main__':
    main()