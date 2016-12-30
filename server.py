#!/usr/bin/env python3
import argparse
import json
import os
import random
import string
from tornado import websocket, web, ioloop

def random_alnum(length):
    alphabet = string.ascii_lowercase+string.ascii_uppercase+string.digits
    return ''.join([random.choice(alphabet) for i in range(length)])

class ProtocolError(Exception):
    pass

class Channel:
    clients = {}
    last = 1

    def __init__(self, socket):
        self.socket = socket
        self.greeting = bytes()
        self.peer = None
        self.destroyed = False

        self.id = '%s%d' % (random_alnum(5), Channel.last)
        Channel.last += 1
        Channel.clients[self.id] = self

    def join(self, peer_id):
        if peer_id not in Channel.clients:
            raise ProtocolError('Requested peer doesn\'t exist')
        peer = Channel.clients[peer_id]
        if peer.peer:
            raise ProtocolError('Peer is already busy')
        self.peer = peer
        self.peer.peer = self

    def destroy(self):
        self.destroyed = True
        del Channel.clients[self.id]

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.channel = Channel(self)
        global args
        if args.debug:
            print(self.channel.id+': New channel')

    def on_message(self, raw):
        global args

        try:
            if isinstance(raw, bytes):
                if self.channel.peer:
                    if self.channel.peer.destroyed:
                        raise ProtocolError('Peer channel is destroyed')
                    # if args.debug:
                    #     print(self.channel.id+': Forwarding message to '+
                    #           self.channel.peer.id)
                    self.channel.peer.socket.write_message(raw,binary=True)
                else:
                    if args.debug:
                        print(self.channel.id+': Setting greeting')
                    if self.channel.greeting:
                        raise ProtocolError('Greeting is already set')
                    self.channel.greeting = raw
                return

            msg = json.loads(raw)
            if msg['type'] == 'keep':
                return
            elif msg['type'] == 'id':
                self.write_message(json.dumps(self.channel.id))
            elif msg['type'] == 'join':
                if args.debug:
                    print(self.channel.id+': Joining with '+msg['id'])
                self.channel.join(msg['id'])
                self.write_message(self.channel.peer.greeting,binary=True)
            else:
                raise ProtocolError('Unknown message type: '+msg['type'])
        except ProtocolError as e:
            print(self.channel.id+': PROTOCOL ERROR: '+str(e))
            self.close()

    def on_close(self):
        global args
        if args.debug:
            print(self.channel.id+': Destroy')
        self.channel.destroy()

if __name__ == '__main__':
    global args
    parser = argparse.ArgumentParser()
    parser.add_argument('-d','--debug',action='store_true')
    parser.add_argument('-p','--port',default=int(os.environ.get('PORT', 5000)))
    args = parser.parse_args()

    app = web.Application([
        ('/ws', SocketHandler),
        ('/(.*)', web.StaticFileHandler, {
            'path': os.path.join(os.path.dirname(__file__),'dist'),
            'default_filename': 'index.html'
        })
    ], debug=args.debug)

    app.listen(args.port)
    ioloop.IOLoop.instance().start()
