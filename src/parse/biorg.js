import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import { Iconv } from 'iconv';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

export async function parseBiorg(sourcePath, query) {
  const index = await fs.promises.readFile(sourcePath)

  // TODO: parse biorg
  // TODO filter query

  try {
    const toStream = new stream.Readable({objectMode: true});

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("parseBiorg", e)
  }
}
