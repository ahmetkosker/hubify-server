import net from 'net';
import Stream, { Transform, Writable } from 'node:stream';

import streamDataConverter from './stream-data-converter.js';

const server = net.createServer();

function collector(data: Buffer) {
  console.log('Processed data:', data.toString());
}

const { pushData } = streamDataConverter(collector);

const transformer = new Transform({
  highWaterMark: 10,
  transform(chunk, _, callback) {
    pushData(chunk);
    callback(null);
  },
});

const writable = new Writable({
  write(chunk, _, callback) {
    console.log(chunk);
    callback();
  },
});

server.on('connection', stream => {
  Stream.pipeline(stream, transformer, writable, error => {
    if (error) {
      console.error('Pipeline error:', error);
    }
  });
});

server.listen(3002, () => {
  console.log('server started on 3002');
});
