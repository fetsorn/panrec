import fs from 'fs';
import path from 'path';
import { writeCSVS } from './csvs.js';
import { buildStdout } from './stdout.js';
import { buildBiorg } from './biorg.js';

export function exportStream(targetPath, targetType, doYank) {
  // if target type is csvs or target path is directory
  // // if target path not directory
  // // // exception metadir no dir
  // // pass entry to buildCSVS stream, return
  const isCSVS = targetPath !== undefined || targetType === 'csvs'
        || (targetPath && fs.statSync(targetPath).isDirectory())

  if (isCSVS) {
    return writeCSVS(path.normalize(targetPath), doYank)
  }

  // TODO: unite with output stream
  // if no target type or target type is json
  // // pass json entry to buildJson
  if (targetPath && targetType === 'json') {
    return buildJson(targetPath)
  }
  // if target type is biorg
  // // pass json entry to buildBiorg stream
  if (targetType === 'biorg') {
    return buildBiorg(targetPath)
  }

  // if no target path
  // // pass string chunk to writeStdin stream
  if (!targetPath) {
    return buildStdout();
  }

  // if target path is file
  // // pass string chunk to writeFile stream
  // otherwise throw
  return fs.createWriteStream(path.normalize(targetPath))
}
