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
          if (bucket.length >= 1) {
            totalSize = bucket[0];
            bucket = bucket.subarray(1);
            mode = MODE.COLLECT_DATA;
            processChunk();
          }
          break;

        case MODE.COLLECT_DATA:
          if (bucket.length > 0) {
            console.log(bucket)
            index++;
            collectedData = Buffer.concat([collectedData, bucket]);
            // console.log(
            //   `Received chunk ${index}: "${bucket}" - Progress: ${
            //     collectedData.length
            //   }/${totalSize}`
            // );
            bucket = Buffer.alloc(0);
          }
          if (collectedData.length === totalSize) {
            onPackage(collectedData);
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
    console.log("Resetting...")
    bucket = Buffer.alloc(0);
    mode = MODE.WAIT_SIZE;
    totalSize = 0;
    collectedData = Buffer.alloc(0);
    index = 0;
  }

  return { dataDivider };
};

export default streamDataConverter;
