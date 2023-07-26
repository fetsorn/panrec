import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

async function parseLine(fileAbsolutePath, searchParams) {
  const entry = {
    _: "datum",
    datum: fileAbsolutePath,
    files: [{_: "file", filename: fileAbsolutePath, filehash: ""}],
    category: "fs"
  }

  // try {
  //   const stats = await fs.promises.stat(fileAbsolutePath)

  //   const date = dayjs(stats.mtime)
  //         .format('YYYY-MM-DDTHH:mm:ss')

  //   entry.actdate = date
  // } catch(e) {
  //   console.error(fileAbsolutePath, e)
  // }

  let matchesQuery = true;

  for (const [key, value] of searchParams.entries()) {
    matchesQuery = entry[key] == value
  }

  if (matchesQuery) {
    return entry
  }
}

export async function parseListing(query) {
  const searchParams = new URLSearchParams(query);

  return new stream.Transform({
    async transform(chunk, encoding, callback) {
      const lines = String(chunk).split("\n").filter((l) => l !== '')

      await Promise.all(lines.map(async (line) => {
        const entry = await parseLine(line, searchParams)

        this.push(JSON.stringify(entry, 2));
      }))

      callback();
    },
  });
}
