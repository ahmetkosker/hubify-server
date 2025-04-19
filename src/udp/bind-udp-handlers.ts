import { createSocket, Socket } from 'node:dgram';

type BindUdpHandlers = {
  port: number;
  host: string;
};

const bindUdpHandlers = ({ port, host }: BindUdpHandlers): Socket => {
  const server = createSocket('udp4');

  server.bind(port, host, () => {
    console.log(`${host}:${port} server is running`);
  });

  server.on('message', (message, remote) => {
    console.log(message.toString());
  });

  return server;
};

export { bindUdpHandlers };
