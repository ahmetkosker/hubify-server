import { Buffer } from 'node:buffer';

type Params = {
  data: Buffer;
};

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
            console.log("paket geldi", totalSize)
            bucket = bucket.subarray(totalSize);

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
