import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { fileURLToPath, URLSearchParams } from 'node:url';
import { CSVS } from '@fetsorn/csvs-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TODO: add WASM fallback
async function grepCallback(contentFile, patternFile, isInverse) {
  // console.log("grepCallback")

  const contentFilePath = `/tmp/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  let output = '';

  try {
    // console.log(`grep ${contentFile} for ${patternFile}`)
    const { stdout, stderr } = await promisify(exec)(
      'export PATH=$PATH:~/.nix-profile/bin/; '
        + `rg ${isInverse ? '-v' : ''} -f ${patternFilePath} ${contentFilePath}`,
    );

    if (stderr) {
      console.log('grep cli failed', stderr);
    } else {
      output = stdout;
    }
  } catch (e) {
    // console.log('grep cli returned empty', e);
  }

  await fs.promises.unlink(contentFilePath);

  await fs.promises.unlink(patternFilePath);

  return output;
}

async function fetchCallback(filepath) {
  try {
    // console.log("fetchCallback", filepath);

    return fs.promises.readFile(filepath, { encoding: 'utf8' });
  } catch {
    throw ("couldn't find file", filepath);
  }
}

export async function readCSVS(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  try {
    const overview = await (new CSVS({
      readFile: async (filepath) => fetchCallback(path.join(sourcePath, filepath)),
      grep: grepCallback,
    })).select(searchParams);

    const toStream = new stream.Readable();

    for (const entry of overview) {
      toStream.push(JSON.stringify(entry, 2))
    }

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("queryStream", e)
  }
}
