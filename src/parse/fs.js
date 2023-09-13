import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { digestMessage, randomUUID } from '@fetsorn/csvs-js';
dayjs.extend(customParseFormat)

async function statPath(sourceAbsolutePath, relativePath, searchParams, doHashsum) {
  const absolutePath = path.join(sourceAbsolutePath, relativePath)

  const files = await fs.promises.readdir(absolutePath)

  return (await Promise.all(files.map(async (file) => {
    const fileRelativePath = path.join(relativePath, file)

    const fileAbsolutePath = path.join(sourceAbsolutePath, fileRelativePath)

    const stats = await fs.promises.stat(fileAbsolutePath)

    if (stats.isDirectory()) {
      return statPath(sourceAbsolutePath, fileRelativePath, searchParams, doHashsum)
    }

    const entry = {
      _: "datum",
      datum: file,
      files: {
        _: "files",
        UUID: await digestMessage(await randomUUID()),
        items: [{
          _: "file",
          UUID: await digestMessage(await randomUUID()),
          filename: fileRelativePath,
          filehash: ""
        }]
      },
      category: "fs"
    }

    if (doHashsum) {
      try {
        const input = await fs.createReadStream(fileAbsolutePath)

        const hash = crypto.createHash('sha256');

        await stream.promises.pipeline(input, hash);

        const hashHex = hash.digest('hex');

        entry.files.items[0].filehash = hashHex
      } catch(e) {
        console.error(fileAbsolutePath, e)
      }
    }

    const date = dayjs(stats.mtime)
          .format('YYYY-MM-DDTHH:mm:ss')

    entry.actdate = date

    let matchesQuery = true;

    for (const [key, value] of searchParams.entries()) {
      matchesQuery = entry[key] == value
    }

    if (matchesQuery) {
      return entry
    }
  }))).flat()
}

export async function parseFS(sourcePath, query, doHashsum) {
  const searchParams = new URLSearchParams(query);

  const entries = await statPath(sourcePath, "", searchParams, doHashsum);

  try {
    const toStream = new stream.Readable({objectMode: true});

    for (const entry of entries) {
      toStream.push(JSON.stringify(entry, 2))
    }

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("fsStream", e)
  }
}
