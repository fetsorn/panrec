import fs from 'fs';
import path from 'path';
import exportCSVS from './csvs.js';
import exportStdout from './stdout.js';
import exportBiorg from './biorg.js';
import exportJson from './json.js';

export default function exportStream(targetPath, targetType, doYank) {
  // if target type is csvs or target path is directory
  // // if target path not directory
  // // // exception metadir no dir
  // // pass entry to exportCSVS stream, return
  const isCSVS =
    targetPath !== undefined ||
    targetType === 'csvs' ||
    (targetPath && fs.statSync(targetPath).isDirectory());

  if (isCSVS) {
    return exportCSVS(path.normalize(targetPath), doYank);
  }

  // TODO: unite with output stream
  // if no target type or target type is json
  // // pass json entry to exportJson
  if (targetPath && targetType === 'json') {
    return exportJson(targetPath);
  }
  // if target type is biorg
  // // pass json entry to exportBiorg stream
  if (targetType === 'biorg') {
    return exportBiorg(targetPath);
  }

  // if no target path
  // // pass string chunk to exportStdout stream
  if (!targetPath) {
    return exportStdout();
  }

  // if target path is file
  // // pass string chunk to createWriteStream stream
  // otherwise throw
  return fs.createWriteStream(path.normalize(targetPath));
}
