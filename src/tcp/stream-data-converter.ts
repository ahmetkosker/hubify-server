import { Buffer } from 'node:buffer';

enum Mode {
  WAIT_SIZE = 'wait_size',
  COLLECT_DATA = 'collect_data',
}

const streamDataConverter = (onPackage: (data: Buffer) => void) => {
  let bucket = Buffer.alloc(0);
  let mode: Mode = Mode.WAIT_SIZE;
  let totalSize = 0;

  const pushData = (data: Buffer) => {
    bucket = Buffer.concat([bucket, data]);

    const processChunk = () => {
      switch (mode) {
        case Mode.WAIT_SIZE:
          if (bucket.length >= 4) {
            totalSize = bucket.readUInt32BE(0);
            bucket = bucket.subarray(4);
            mode = Mode.COLLECT_DATA;
            processChunk();
          }
          break;

        case Mode.COLLECT_DATA:
          if (bucket.length >= totalSize) {
            console.log('package received', totalSize);
            const messageData = bucket.subarray(0, totalSize);
            bucket = bucket.subarray(totalSize);
            
            onPackage(messageData);
            mode = Mode.WAIT_SIZE;
            totalSize = 0;

            processChunk();
          }

          break;

        default:
          break;
      }
    };

    processChunk();
  };

  return { pushData };
};

export default streamDataConverter;
