import fs from 'fs';
import os from 'os';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { digestMessage } from '@fetsorn/csvs-js';
import crypto from 'crypto';
dayjs.extend(customParseFormat)

const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'csvs-'))

async function parseLine(sourcePath, searchParams, filePath) {
  const filename = sourcePath
        ? filePath.replace(`${sourcePath}`, '')
        : filePath;

  await fs.promises.appendFile(path.join(tmpdir, 'log'), `${filename}\n`)

  const entry = {
    _: "file",
    UUID: await digestMessage(filename),
    filename
  }

  const fileAbsolutePath = `${sourcePath}/${filename}`;

  // try {
  //   const input = await fs.createReadStream(fileAbsolutePath)

  //   const hash = crypto.createHash('sha256');

  //   await stream.promises.pipeline(input, hash);

  //   const hashHex = hash.digest('hex');

  //   entry.filehash = hashHex
  // } catch(e) {
  //   console.error(fileAbsolutePath, e)
  // }

  try {
    const stats = await fs.promises.stat(fileAbsolutePath)

    const date = dayjs(stats.mtime)
          .format('YYYY-MM-DDTHH:mm:ss')

    entry.moddate = date
  } catch(e) {
    console.error(fileAbsolutePath, e)
  }

  let matchesQuery = true;

  for (const [key, value] of searchParams.entries()) {
    matchesQuery = entry[key] == value
  }

  if (matchesQuery) {
    return entry
  }
}

export async function parseListing(sourcePath, query) {
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
        const entry = await parseLine(sourcePath, searchParams, line)

        this.push(entry);
      }))

      callback();
    },

    async final(next) {
      if (this._buffer) {
        const entry = await parseLine(sourcePath, searchParams, this._buffer);

        this.push(JSON.stringify(entry, 2))
      }

      next();
    }
  });
}
