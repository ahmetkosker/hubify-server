import net from 'net';
import Stream, { Transform, Writable } from 'node:stream';

import streamDataConverter from './stream-data-converter.js';
import { randomUUID } from 'node:crypto';

const NAMES = [
  'John',
  'Jane',
  'Jim',
  'Jack',
  'Jill',
  'Kendall',
  'Kylie',
  'Trump',
  'Obama',
  'Biden',
  'Putin',
  'Xi',
  'Macron',
  'Merkel',
];

const server = net.createServer();

let users: {
  clientId: string;
  socketId: string;
  connectedDate: Date;
  ip: string;
  name: string;
}[] = [];

function collector(data: Buffer) {
  console.log('Processed data:', data.toString());
}

const { pushData } = streamDataConverter(collector);

server.on('connection', (stream) => {
  const socketId = randomUUID();
  let isAuthenticated = false;
  let idBuffer = Buffer.alloc(0);

  const authLayer = new Transform({
    transform(chunk, _, callback) {
      if (isAuthenticated) {
        console.log('from', users.find((user) => user.clientId === idBuffer.toString('hex'))?.name);
        this.push(chunk);
        callback();
      } else {
        idBuffer = Buffer.concat([idBuffer, chunk]);
        if (idBuffer.length >= 4) {
          isAuthenticated = true;
          const leftData = idBuffer.subarray(4);

          const socketInfo = stream.address() as net.AddressInfo;
          users.push({
            clientId: idBuffer.toString('hex'),
            socketId: socketId,
            connectedDate: new Date(),
            ip: socketInfo.address,
            name: NAMES[Math.floor(Math.random() * NAMES.length)],
          });

          console.log('data is too much');

          this.push(leftData);
          callback();
        }
      }
    },
  });

  const transformer = new Transform({
    highWaterMark: 10,
    transform(chunk, _, callback) {
      pushData(chunk);
      this.push(chunk);
      callback(null);
    },
  });

  const writable = new Writable({
    write(chunk, _, callback) {
      callback(null);
    },
  });

  Stream.pipeline(stream, authLayer, transformer, writable, (error) => {
    if (error) {
      console.error('Pipeline error:', error);
    }
  });

  stream.on('close', () => {
    const disconnectedUser = users.find((user) => user.socketId === socketId);
    if (disconnectedUser) {
      users = users.filter((user) => user.socketId !== socketId);
      console.log(`${disconnectedUser.name} disconnected`);
    }
  });

  stream.on('error', (error) => {
    console.log(`Client with socket ID ${socketId} error: ${error.message}`);
  });
});

server.on('end', () => {
  console.log('Client sent FIN packet (end)');
});

server.listen(3002, () => {
  console.log('server started on 3002');
});
