import fs from 'fs';
import path from 'path';
import stream from 'stream';

export async function parseJSON(sourcePath, query) {
  const index = await fs.promises.readFile(sourcePath)

  // TODO filter query
  const entries = JSON.parse(index)

  try {
    const toStream = new stream.Readable({objectMode: true});

    entries.forEach((e) => toStream.push(e))

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("parseJSON", e)
  }
}
