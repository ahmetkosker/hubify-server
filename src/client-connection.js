import net from 'net';
import readline from 'readline';
import process from 'process';
import { Buffer } from 'buffer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function calculateTotalSize(messages) {
  return messages.reduce((total, msg) => total + Buffer.from(msg).length, 0);
}

function createPacket(data, isFirst = false, totalSize = 0) {
  if (isFirst) {
    const firstChunk = Buffer.alloc(1 + data.length);
    firstChunk[0] = totalSize; 
    Buffer.from(data).copy(firstChunk, 1);
    return firstChunk;
  } else {
    return Buffer.from(data);
  }
}

const question = socket => {
  rl.question('Enter a message: ', message => {
    const packet = createPacket(message);
    socket.write(packet);
    console.log(`Sent: "${message}" (${message.length} bytes)`);
    question(socket);
  });
};

const client = net.connect(3002, () => {
  console.log('🔌 Connected to server');
  
  const messages = ['Hello ', 'World ', 'Testing ', 'Protocol'];
  const totalSize = calculateTotalSize(messages);
  console.log('📊 Total size of all messages:', totalSize);
  
  messages.forEach((message, index) => {
    setTimeout(() => {
      const isFirst = index === 0;
      const packet = createPacket(message, isFirst, totalSize);
      client.write(packet);
      
      if (isFirst) {
        console.log(`📤 Sent first chunk with total size ${totalSize} and data: "${message}"`);
      } else {
        console.log(`📤 Sent chunk ${index + 1}: "${message}"`);
      }
    }, 1000 * index);
  });
  
});

client.on('data', data => {
  console.log('📥 Received:', data.toString());
});

client.on('end', () => {
  console.log('🔌 Disconnected from server');
});

client.on('error', err => {
  console.error('❌ Connection error:', err);
});

export default client;
