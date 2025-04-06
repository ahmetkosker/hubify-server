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
  stream?: net.Socket;
}[] = [];

function collector(data: Buffer, socketId: string) {
  const message = data.toString();
  const user = users.find((u) => u.socketId === socketId);
  const userName = user ? user.name : 'Unknown User';

  if (message === '/users') {
    listConnectedUsers();
    return;
  }

  broadcastMessage(`${userName}: ${message}`, socketId);
}

function broadcastMessage(message: string, socketId: string) {
  const user = users.find((u) => u.socketId === socketId);

  users.map((u) => {
    if (u.socketId !== socketId) {
      u.stream?.write(message);
    }
  });
}

function listConnectedUsers() {
  const userList = users.map((u) => u.name).join('\n');
  broadcastMessage(`Connected users:\n${userList}`, 'server');
}

server.on('connection', (stream) => {
  const socketId = randomUUID();
  let isAuthenticated = false;
  let idBuffer = Buffer.alloc(0);

  const authLayer = new Transform({
    transform(chunk, _, callback) {
      if (isAuthenticated) {
        this.push(chunk);
        callback();
      } else {
        idBuffer = Buffer.concat([idBuffer, chunk]);
        if (idBuffer.length >= 4) {
          isAuthenticated = true;
          const leftData = idBuffer.subarray(4);

          const socketInfo = stream.address() as net.AddressInfo;
          const userName = NAMES[Math.floor(Math.random() * NAMES.length)];
          users.push({
            clientId: idBuffer.toString('hex'),
            socketId: socketId,
            connectedDate: new Date(),
            ip: socketInfo.address,
            name: userName,
            stream: stream,
          });

          console.log(`${userName} connected from ${socketInfo.address}`);
          broadcastMessage(`${userName} connected`, socketId);

          this.push(leftData);
          callback();
        }
      }
    },
  });

  const { pushData } = streamDataConverter((data: Buffer) => collector(data, socketId));

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
