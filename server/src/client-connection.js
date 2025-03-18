import dgram from 'dgram';
import readline from 'readline';

const client = dgram.createSocket('udp4');

const rl = readline.createInterface({
  input: globalThis.process.stdin,
  output: globalThis.process.stdout,
});

const cli = () => {
  rl.question('Your message:  ', answer => {
    if (answer === 'exit') {
      client.close();
      rl.close();
    } else {
      client.send(answer);
      setTimeout(() => {
        cli();
      }, 0);
    }
  });
};

client.on('message', msg => {
  console.log(`${msg.toString()}`);
});

client.on('error', () => {
  client.close();
});

client.connect(3002, '127.0.0.1', () => {
  client.send('connected');
  cli();
});

export default client;
