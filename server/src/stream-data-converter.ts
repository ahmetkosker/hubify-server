import { Buffer } from 'node:buffer';

type Params = {
  data: Buffer;
};

enum MODE {
  WAIT_SIZE = 'wait_size',
  COLLECT_DATA = 'collect_data',
}

const streamDataConverter = (onPackage: (data: Buffer) => void) => {
  let bucket = Buffer.alloc(0);
  let mode: MODE = MODE.WAIT_SIZE;
  let totalSize = 0;
  let collectedData = Buffer.alloc(0);
  let index = 0;

  const dataDivider = (data: Buffer) => {
    bucket = Buffer.concat([bucket, data]);

    const processChunk = () => {
      switch (mode) {
        case MODE.WAIT_SIZE:
          if (bucket.length >= 4) {
            totalSize = bucket.readUInt32BE(0);
            bucket = bucket.subarray(4);
            mode = MODE.COLLECT_DATA;
            processChunk();
          }
          break;

        case MODE.COLLECT_DATA:
          if (bucket.length > 0) {
            index++;
            collectedData = Buffer.concat([collectedData, bucket]);
            console.log(
              `${collectedData.length} / ${totalSize} (${(
                (collectedData.length / totalSize) *
                100
              ).toFixed(2)}%)`
            );
            bucket = Buffer.alloc(0);
          }
          if (collectedData.length === totalSize) {
            console.log(index, ' steps');
            reset();
          }

          break;

        default:
          break;
      }
    };

    processChunk();
  };

  function reset() {
    console.log('Resetting...');
    bucket = Buffer.alloc(0);
    mode = MODE.WAIT_SIZE;
    totalSize = 0;
    collectedData = Buffer.alloc(0);
    index = 0;
  }

  return { dataDivider };
};

export default streamDataConverter;
