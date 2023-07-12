#! /usr/bin/env node
import { Command } from 'commander';
import { packageJSON } from './utils/packageJson.js';
import { readCSVS } from './parse/csvs.js';
import { parseVK } from './parse/vk.js';
import { writeCSVS } from './build/csvs.js';
import stream from 'stream';
import util from 'util';
import path from 'path';
import fs from 'fs';
const pipeline = util.promisify(stream.pipeline);

function readBiorg(chunk, query) {
  // parse biorg
  // match entry to query
  // stream entries -->
}

function readJson(chunk, query) {
  // parse json
  // match entry to query
  // stream entries -->
}

function writeTmpMetadir(chunk) {
  // write metadir to temporary dir
}

// @returns {Stream}
function readFS(path) {
  // list file paths as stream -->
  // --> stream stat of files -->
  // --> stream entries -->
}

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

// @param {string} sourcePath - Path to source
// @param {string} query - Query string
// @returns {Stream}
async function readStream(sourcePath, query) {
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

  // if no stdin and no source path or source path is directory
  // // // detect source type is csvs
  if (await isCSVS(sourcePath)) {
    return readCSVS(sourcePath, query)
  }
  // // // otherwise source type is fs
  // // // // return readFS stream on sourcePath

  // // if source type is vk
  if (await isVK(sourcePath)) {
    // // // pipe stdin stream to parseVK
    return parseVK(sourcePath, query)
  }

  // if source path is bi.org
  // // detect source type is biorg
  // // // read sourcePath as stream
  // // // pipe contents stream to parseBiorg

  // if source path is .json
  // // detect source type is json
  // // // read sourcePath as stream
  // // // pipe contents stream to parseJson
}

function gcStream(gc) {
  // if --gc optimize
  // if gc is true, transform stream with gc
  // otherwise pass pass through
  return Passthrough();
}

function mapStream() {
  // map source and target schemas
  // transform
}

// builds json array string from json objects
// @returns stream
function buildJson(entry) {
}

function buildBiorg(entry) {
}

function writeStream(targetPath, targetType) {

  // if target type is csvs or target path is directory
  // // if target path not directory
  // // // exception metadir no dir
  // // pass entry to buildCSVS stream, return
  const isCSVS = targetPath !== undefined || targetType === 'csvs'
        || (targetPath && fs.statSync(targetPath).isDirectory())

  if (isCSVS) {
    return writeCSVS(path.normalize(targetPath))
  }

  // TODO: unite with output stream
  // if no target type or target type is json
  // // pass json entry to buildJson
  if (!targetType || targetType === 'json') {
    // buildJson()
  }
  // if target type is biorg
  // // pass json entry to buildBiorg stream
  if (targetType === 'biorg') {
    // buildBiorg()
  }

  // if no target path
  // // pass string chunk to writeStdin stream
  if (!targetPath) {
    return process.stdout;
  }

  // if target path is file
  // // pass string chunk to writeFile stream
  // otherwise throw
  return fs.createWriteStream(path.normalize(targetPath))
}

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description('Manage csvs databases.')
    .version(packageJSON.version, '-v, --version')
    .option('-i, --source-path <string>', 'Path to source', process.cwd())
    .option('-o, --target-path <string>', 'Path to target')
    // TODO if targetPath is specified, targetType defaults to "csvs"
    .option('-t, --target-type <string>', 'Type of target', 'json')
    .option('-q, --query <string>', 'Search string', '?')
    .option('--gc', 'Collect dangling database nodes')
    .action(async (options) => {
      try {
        await pipeline(
          await readStream(options.sourcePath, options.query),
          // gcStream(options.gc),
          // mapStream(),
          writeStream(options.targetPath, options.targetType)
        )
      } catch(e) {
        console.log("pipeline", e)
      }
    });

  program.parse();
})();
