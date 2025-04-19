import { createSocket } from 'node:dgram';

const client = createSocket('udp4');

client.bind(3004);

client.on('message', (message, remote) => {
  console.log(message.toString());
});
