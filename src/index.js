#! /usr/bin/env node
import { Command } from 'commander';
import { packageJSON } from './utils/packageJson.js';
import { query } from './query.js';
import stream from 'stream';
import util from 'util';
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
function readCSVS(path, query) {
  // query
  // stream entries -->
  // run -q or empty search query
  // --> stream entries -->
}

// @returns {Stream}
function readFS(path) {
  // list file paths as stream -->
  // --> stream stat of files -->
  // --> stream entries -->
}

// @param {string} sourcePath - Path to source
// @param {string} query - Query string
// @returns {Stream}
function readStream(sourcePath, query) {
  const toStream = new stream.Readable();
  toStream.push(JSON.stringify({"a": "a"}))
  toStream.push(null);
  return toStream;
  // if stdin
  // // if stdin and source path
  // // // exception stdin source path
  // // if source type is biorg
  // // // pipe stdin stream to parseBiorg
  // // if source type is json
  // // // pipe stdin stream to parseJson
  // // if source type is csvs metadir stream
  // // // pipe stdin stream to writeTmpMetadir
  // // // return readMetadir stream on temporary metadir

  // if no stdin and no source path or source path is directory
  // // // detect source type is csvs
  // // // // return readMetadir stream on sourcePath
  // // // otherwise source type is fs
  // // // // return readFS stream on sourcePath

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

function buildCSVS() {
  // --> write entries to metadir
  // // if source path is csvs
  // // // copy binary blobs from source asset endpoint to target
}

function writeStdin(chunk) {
  // // --> output to stdin
}

function writeFile(filepath, chunk) {
  // // --> output to file
}

function writeStream(targetPath, targetType) {

  // if target type is csvs or target path is directory
  // // if target path not directory
  // // // exception metadir no dir
  // // pass entry to buildCSVS stream, return
  // if (targetType === 'csvs' || fs.isDirectory(targetPath)) {
  //   return buildCSVS()
  // }

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
  return fs.createWriteStream("output.txt")
}

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description('Manage csvs databases.')
    .version(packageJSON.version, '-v, --version')
    .option('-i, --source-path <string>', 'Path to source') // defautls to .
    .option('-o, --target-path <string>', 'Path to target') // defaults to undefined
    .option('-t, --target-type <string>', 'Type of target') // defaults to "json", if targetPath is specified defaults to "csvs"
    .option('-q, --query <string>', 'Search string') // defaults to "?"
    .option('--gc', 'Collect dangling database nodes')
    .action(async (options) => {
      try {
        await pipeline(
          readStream(options.sourcePath, options.query),
          // gcStream(options.gc),
          // mapStream(),
          writeStream(options.targetPath, options.targetType)
        )
      } catch {

      }
    });

  program.parse();
})();
