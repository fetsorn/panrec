import fs from 'fs';
import path from 'path';
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
  const realpath = path.join(process.cwd(), filepath);

  let contents;

  try {
    console.log("fetchCallback", filepath, realpath);
    contents = await fs.promises.readFile(realpath, { encoding: 'utf8' });

    return contents;
  } catch {
    throw ("couldn't find file", filepath);
  }
}

export async function query(query, options) {
  const searchParams = new URLSearchParams(query);

  console.log(searchParams)

  try {
    const overview = await (new CSVS({
      readFile: fetchCallback,
      grep: grepCallback,
    })).select(searchParams);

    console.log(overview, 2)
  } catch(e) {
    console.log(e)
  }
}
