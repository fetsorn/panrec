import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { digestMessage, randomUUID } from '@fetsorn/csvs-js';
dayjs.extend(customParseFormat)

async function foo(sourceAbsolutePath, relativePath, searchParams) {
  const absolutePath = path.join(sourceAbsolutePath, relativePath)

  const files = await fs.promises.readdir(absolutePath)

  return (await Promise.all(files.map(async (file) => {
    const fileRelativePath = path.join(relativePath, file)

    const fileAbsolutePath = path.join(sourceAbsolutePath, fileRelativePath)

    const stats = await fs.promises.stat(fileAbsolutePath)

    if (stats.isDirectory()) {
      return foo(sourceAbsolutePath, fileRelativePath, searchParams)
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

export async function parseFS(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  const entries = await foo(sourcePath, "", searchParams);

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
