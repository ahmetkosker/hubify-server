import net from 'net';
import { randomBytes } from 'crypto';

const client = net.connect(3002, () => {
  const id = randomBytes(4);
  client.write(id);
  console.log(id, ' connected');

  const payload = Buffer.from('X'.repeat(1024 * 1024));
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);

  const packet = Buffer.concat([header, payload]);
  console.log(`Sending packet: ${packet.length} bytes`);

  client.write(packet);
});

client.on('data', (data) => {
  console.log('Response from server:', data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});
