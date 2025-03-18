import dgram from 'dgram';
import crypto from 'crypto';

const server = dgram.createSocket('udp4');

const connectedClients: { address: string; port: number; id: string }[] = [];

server.on('message', (msg, rinfo) => {
  if (msg.toString() === 'connected') {
    const id = crypto.randomBytes(8).toString('hex');
    console.log('Client connected', id);
    connectedClients.push({ address: rinfo.address, port: rinfo.port, id });
  } else {
    connectedClients.forEach(client => {
      if (client.port !== rinfo.port) {
        server.send(`[${client.id}]:${msg.toString()}`, client.port, client.address);
      }
    });
  }
});

server.on('error', err => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.on('connection', socket => {
  console.log('Client connected', socket);
});

server.bind(3002);
