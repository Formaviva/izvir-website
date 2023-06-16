import http.server
import socketserver
import signal
import sys

PORT = 8000

class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def signal_handler(signal, frame):
    print("\nShutting down the server...")
    httpd.shutdown()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

with socketserver.TCPServer(("", PORT), NoCacheRequestHandler) as httpd:
    print(f"Server is running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
