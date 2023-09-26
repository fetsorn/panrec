import fs from 'fs';
import path from 'path';
import stream from 'stream';
import process from 'process';
import { spawn } from 'child_process';
import { fileURLToPath, URLSearchParams } from 'node:url';
import { CSVS } from '@fetsorn/csvs-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TODO: add WASM fallback
async function grepCallback(contentFile, patternFile, isInverse) {
  // console.log("grepCallback")

  const contentFilePath = `/tmp/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/${crypto.randomUUID()}`;

  const outputFilePath = `/tmp/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  const outputStream = fs.createWriteStream(outputFilePath);

  try {
    await new Promise((res, rej) => {
      const cmd = `/Users/fetsorn/.nix-profile/bin/rg`;

      const flags = (isInverse ? ['-v'] : []).concat([
        '-f',
        patternFilePath,
        contentFilePath,
      ]);

      const top = spawn(cmd, flags);

      top.stdout.on('data', data => {
        outputStream.write(data);
      });

      top.stderr.on('data', data => {
        rej(data.toString());
      });

      top.on('close', code => {
        res();
      });
    });
  } catch (e) {
    console.log('AAA', e);
  }

  const output = await fs.promises.readFile(outputFilePath, {
    encoding: 'utf8',
  });

  await fs.promises.unlink(contentFilePath);

  await fs.promises.unlink(patternFilePath);

  await fs.promises.unlink(outputFilePath);

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

  const csvs = new CSVS({
    readFile: async filepath => fetchCallback(path.join(sourcePath, filepath)),
    grep: grepCallback,
  });

  const queryStream = await csvs.selectStream(searchParams);

  return queryStream;
}
