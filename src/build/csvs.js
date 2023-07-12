import fs from 'fs';
import path from 'path';
import { CSVS } from '@fetsorn/csvs-js';

export function writeCSVS(targetPath) {
  async function readFile(filepath) {
    const realpath = path.join(targetPath, filepath);

    let contents;

    try {
      contents = await fs.promises.readFile(realpath, { encoding: 'utf8' });

      return contents;
    } catch {
      throw ("couldn't find file", filepath);
    }
  }

  async function writeFile(filepath, content) {
    const realpath = path.join(targetPath, filepath);

    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = filepath.split(path.sep);

    // remove file name
    pathElements.pop();

    let root = '';

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += path.sep;

      const files = await fs.promises.readdir(path.join(targetPath, root));

      if (!files.includes(pathElement)) {
        try {
          await fs.promises.mkdir(path.join(targetPath, root, pathElement));
        } catch {
          // do nothing
        }
      } else {
        // console.log(`${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await fs.promises.writeFile(realpath, content);
  }

  const csvs = new CSVS({
    readFile,
    writeFile
  })

  return new WritableStream({
    objectMode: true,
    async write(entry, encoding, next) {
      // TODO: check that entry is valid for csvs
      await csvs.update(JSON.parse(entry))
    },
    close() {
    },
    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
