import net, { Socket } from 'net';
import Stream, { getDefaultHighWaterMark, Transform, Writable } from 'stream';
import v8 from 'node:v8';
import fs from 'node:fs';

const server = net.createServer();

let bytesToConsume = 0;
let message = Buffer.alloc(0);

export const packageStream = (onPackage: (data: Buffer, type: number, size: number) => void) => {
  let bucket = Buffer.alloc(0);

  let mode: 'reading-header' | 'reading-payload' = 'reading-header';
  let packageType = 0;
  let packageSize = 0;

  const writeChunk = (b: Buffer) => {
    bucket = Buffer.concat([bucket, b]);

    const read = () => {
      switch (mode) {
        case 'reading-header': {
          if (bucket.length >= HEADER_SIZE) {
            packageType = bucket.readInt8(0);
            packageSize = bucket.readUInt32LE(1);
            bucket = bucket.subarray(HEADER_SIZE);
            mode = 'reading-payload';
            read();
          }
          return;
        }
        case 'reading-payload': {
          if (bucket.length >= packageSize) {
            onPackage(bucket.subarray(0, packageSize), packageType, packageSize);
            bucket = bucket.subarray(packageSize);
            mode = 'reading-header';
            read();
          }
          return;
        }
      }
    };

    read();
  };

  return { writeChunk };
};

let messageTransformer: Transform;

const { writeChunk } = packageStream((data, type, size) => {
  messageTransformer.push({
    data: data.toString(),
    type,
    size,
  });
});

messageTransformer = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    writeChunk(chunk);
    callback();
  },
});

const writable = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    console.log('chunk:', chunk);
    callback();
  },
});

server.on('connection', (socket: Socket) => {
  Stream.pipeline(socket, messageTransformer, writable, error => {
    if (error) {
      console.error(error);
    }
  });
});

server.listen(3002, () => {
  console.log('Server is running on port 3002');
});

export const HEADER_SIZE = 5;

export const JSON_PACKAGE = 0;
export const PCM_PACKAGE = 1;

export const createPackage = (payload: Buffer, packageType: number) => {
  const header = Buffer.alloc(5);
  header.writeUInt8(packageType, 0);
  header.writeUint32LE(payload.length, 1);

  return Buffer.concat([header, payload]);
};
