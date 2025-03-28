import net from 'net';
import { Buffer } from 'buffer';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = () => {
  rl.question('Enter a message: ', message => {
    const buffer = Buffer.alloc(5 + message.length);
    buffer.writeInt8(0, 0);
    buffer.writeUInt32LE(message.length, 1);
    buffer.write(message, 5);
    client.write(buffer);
    console.log('Sent message:', buffer);
    question();
  });
};

const client = net.connect(3002, () => {
  console.log('Connected to server');

  question();
});

client.on('data', data => {
  console.log('Received from server:', data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', err => {
  console.error('Connection error:', err);
});

export default client;
