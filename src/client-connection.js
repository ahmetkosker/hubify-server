import net from 'net';


const client = net.connect({ port: 3002, host: '13.60.172.90' }, () => {
  console.log('Connected to server');

  const payload = Buffer.from('X'.repeat(1024 * 1024));
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);

  const packet = Buffer.concat([header, payload]);
  console.log(`Sending packet: ${packet.length} bytes`);

  setInterval(() => {
    client.write(packet);
  }, 10)
});

client.on('data', data => {
  console.log('Response from server:', data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', err => {
  console.error('Connection error:', err);
});
