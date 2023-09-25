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

export async function parseJSONStream(query) {
  const searchParams = new URLSearchParams(query);

  return new stream.Transform({
    objectMode: true,

    async transform(chunk, encoding, callback) {
      const content = (this._buffer ?? "") + String(chunk);

      const lines = content.split("\n").filter((l) => l !== '')

      const tail = content[content.length - 1] === '\n'
            ? ""
            : lines.pop();

      this._buffer = tail;

      await Promise.all(lines.map(async (line) => {
        this.push(JSON.parse(line))
      }))

      callback();
    },

    async final(next) {
      if (this._buffer) {
        this.push(JSON.parse(this._buffer))
      }

      next();
    }
  });
  try {
    const toStream = new stream.Readable({objectMode: true});

    entries.forEach((e) => toStream.push(e))

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("parseJSON", e)
  }
}

export async function parseListing(sourcePath, query, doHashsum) {
  const searchParams = new URLSearchParams(query);

  return new stream.Transform({
    objectMode: true,

    async transform(chunk, encoding, callback) {
      const content = (this._buffer ?? "") + String(chunk);

      const lines = content.split("\n").filter((l) => l !== '')

      const tail = content[content.length - 1] === '\n'
            ? ""
            : lines.pop();

      this._buffer = tail;

      await Promise.all(lines.map(async (line) => {
        const entry = await parseLine(sourcePath, searchParams, line, doHashsum)

        this.push(entry);
      }))

      callback();
    },

    async final(next) {
      if (this._buffer) {
        const entry = await parseLine(sourcePath, searchParams, this._buffer, doHashsum);

        this.push(JSON.stringify(entry, 2))
      }

      next();
    }
  });
}
