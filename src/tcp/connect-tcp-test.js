import net from 'net';
import { randomBytes } from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = net.connect({ port: 3002, host: 'localhost' }, () => {
  const id = randomBytes(4);
  client.write(id);
  console.log('Connected to server');

  console.log('Type your message and press Enter to send:');
  console.log('Commands:');
  console.log('  /users - List all connected users');
  console.log('  exit - Disconnect from the server');
});

rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit') {
    console.log('Closing connection...');
    client.end();
    rl.close();
    return;
  }

  if (input.toLowerCase() === '/users') {
    console.log('Requesting user list...');
    const payload = Buffer.from('/users');
    const header = Buffer.alloc(4);
    header.writeUInt32BE(payload.length, 0);
    const packet = Buffer.concat([header, payload]);
    client.write(packet);
    return;
  }
  
  const payload = Buffer.from(input);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);
  
  const packet = Buffer.concat([header, payload]);
  console.log(`Sending message: "${input}"`);
  
  client.write(packet);
});

client.on('data', (data) => {
  console.log(data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server');
  rl.close();
  process.exit(0);
});

client.on('error', (err) => {
  console.error('Connection error:', err);
  rl.close();
  process.exit(1);
});
