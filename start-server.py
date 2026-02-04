#!/usr/bin/env python3
"""
Simple HTTP Server for JoinWork
Serves static files from the frontend directory
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
PORT = 3000
FRONTEND_DIR = Path(__file__).parent / 'frontend'

# Change to frontend directory
os.chdir(FRONTEND_DIR)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print("\n" + "="*60)
            print("  JoinWork - Development Server")
            print("="*60)
            print(f"  Server running at: http://localhost:{PORT}")
            print(f"  Frontend directory: {FRONTEND_DIR}")
            print("="*60)
            print(f"\n  Open your browser and navigate to: http://localhost:{PORT}")
            print("  Press Ctrl+C to stop the server\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:  # Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print("Please close the application using that port or change the PORT in this script.")
        else:
            print(f"\nError starting server: {e}")
        sys.exit(1)

