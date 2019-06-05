import SimpleHTTPServer
import SocketServer
with open('conf') as f:
    first_line = f.readline()
PORT = int(first_line)

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
SocketServer.TCPServer.allow_reuse_address = True
httpd = SocketServer.TCPServer(("127.0.0.1", PORT), Handler)
httpd.serve_forever()
