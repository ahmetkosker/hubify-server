import { createSocket } from 'node:dgram';

const client = createSocket('udp4');

client.bind(3001);

client.send('hello from test 3001', 3004, 'localhost');

client.on('message', (message, remote) => {
  console.log(message.toString());
});
