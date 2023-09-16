import fs from 'fs';
import stream from 'stream';
import { readCSVS } from './csvs.js';
import { parseVK } from './vk.js';
import { parseTG } from './tg.js';
import { parseFS } from './fs.js';
import { parseBiorg } from './biorg.js';
import { parseListing } from './listing.js';

async function isCSVS(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/metadir.json`)

    return true
  } catch {
    return false
  }
}

async function isVK(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/messages/index-messages.html`)

    return true
  } catch {
    return false
  }
}

async function isTG(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/result.json`)

    return true
  } catch {
    return false
  }
}

async function isFS(sourcePath) {
  try {
    const stats = await fs.promises.stat(sourcePath)

    return stats.isDirectory()
  } catch {
    return false
  }
}

async function isBiorg(sourcePath) {
  return (new RegExp(/org$/)).test(sourcePath)
}

async function isJSON(sourcePath) {
  return (new RegExp(/json$/)).test(sourcePath)
}

export function passthroughStream() {
  return new stream.Transform({
    objectMode: true,

    async write(entry, encoding, next) {
      this.push(entry);

      next()
    },

    close() {
    },

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}

export async function transformStream(sourcePath, query, doHashsum) {
  // if stdin
  // // if stdin and source path
  // // // exception stdin source path
  // // if source type is biorg
  // // // pipe stdin stream to parseBiorg
  // // if source type is json
  // // // pipe stdin stream to parseJson
  // // if source type is csvs metadir stream
  // // // pipe stdin stream to writeTmpMetadir
  // // // return queryStream on temporary metadir

  return parseListing(sourcePath, query, doHashsum)
}

// @param {string} sourcePath - Path to source
// @param {string} query - Query string
// @returns {Stream}
export async function importStream(sourcePath, query, doHashsum) {
  // if no stdin and no source path or source path is directory
  // // // detect source type is csvs
  if (await isCSVS(sourcePath)) {
    return readCSVS(sourcePath, query);
  }
  // // // otherwise source type is fs
  // // // // return readFS stream on sourcePath

  // // if source type is vk
  if (await isVK(sourcePath)) {
    // // // read filesystem with parseVK
    return parseVK(sourcePath, query);
  }

  // // if source type is tg
  if (await isTG(sourcePath)) {
    // // // read filesystem with parseTG
    return parseTG(sourcePath, query);
  }

  if (await isFS(sourcePath)) {
    return parseFS(sourcePath, query, doHashsum);
  }

  if (await isBiorg(sourcePath)) {
    return parseBiorg(sourcePath, query);
  }

  if (await isJSON(sourcePath)) {
    return parseJSON(sourcePath, query);
  }
}
