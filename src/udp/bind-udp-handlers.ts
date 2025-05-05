import { createSocket, Socket } from 'node:dgram';

type BindUdpHandlers = {
  port: number;
  host: string;
};

let listeners: string[] = [];

const bindUdpHandlers = async ({ port, host }: BindUdpHandlers): Promise<Socket> => {
  return new Promise<Socket>((resolve, reject) => {
    const server = createSocket('udp4');

    server.once('error', (err) => {
      console.error('error');
      server.close();
      reject(err);
    });

    server.once('listening', () => {
      console.log(`UDP server listening on ${host}:${port}`);

      server.on('message', (message, rinfo) => {
        console.log(`Received from ${rinfo.address}:${rinfo.port} - ${message.toString()}`);
      });

      resolve(server);
    });

    server.bind(port, host);
  });
};

const addListener = (id: string) => {
  if (listeners.includes(id)) {
    return;
  }
  listeners.push(id);
};

const removeListener = (id: string) => {
  if (listeners.includes(id)) {
    listeners = listeners.filter((listener) => listener === id);
  }
};

export { bindUdpHandlers, addListener, removeListener };
