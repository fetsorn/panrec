import fs from "fs";
import os from "os";
import path from "path";
import { CSVS } from "@fetsorn/csvs-js";

async function addLFS({ fs: fsVirt, dir, filepath }) {
  const fileBlob = await fsVirt.promises.readFile(path.join(dir, filepath));

  const { buildPointerInfo, formatPointerInfo } = await import(
    "@fetsorn/isogit-lfs"
  );

  const pointerInfo = await buildPointerInfo(fileBlob);

  // turn blob into pointer
  const pointerBlob = formatPointerInfo(pointerInfo);

  const { writeBlob, updateIndex } = await import("isomorphic-git");

  const pointerOID = await writeBlob({
    fs: fsVirt,
    dir,
    blob: pointerBlob,
  });

  await updateIndex({
    fs: fsVirt,
    dir,
    filepath,
    oid: pointerOID,
    add: true,
  });
}

export default function writeCSVS(targetPath, doYank) {
  async function readFile(filepath) {
    const realpath = path.join(targetPath, filepath);

    let contents;

    try {
      contents = await fs.promises.readFile(realpath, { encoding: "utf8" });

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

    let root = "";

    Promise.all(
      pathElements.map(async (pathElement) => {
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
      }),
    );

    // NOTE: this dance is supposed to guarantee that realpath is not invalid
    // a writeFile to realpath would make realpath invalid during writing
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "csvs-"));

    const tmpPath = path.join(tmpdir, "tmp");

    await fs.promises.writeFile(tmpPath, content);

    try {
      await fs.promises.unlink(realpath);
    } catch {
      // if no file, do nothing
    }

    // here realpath is valid again
    await fs.promises.link(tmpPath, realpath);

    await fs.promises.rm(tmpdir, { recursive: true });
  }

  const csvs = new CSVS({
    readFile,
    writeFile,
  });

  return new WritableStream({
    objectMode: true,

    // eslint-disable-next-line no-unused-vars
    async write(entry, encoding, next) {
      // TODO: check that entry is valid for csvs
      await csvs.update(entry);

      if (doYank) {
        if (entry.files.items[0]) {
          try {
            const { sourcepath, filename, filehash } = entry.files.items[0];

            const filepath = path.join("lfs", filehash);

            await fs.promises.copyFile(
              path.join(sourcepath, filename),
              path.join(targetPath, filepath),
            );

            await addLFS({
              fs,
              dir: targetPath,
              filepath,
            });
          } catch (e) {
            // do nothing
            // console.log(e)
          }
        }
      }
    },
    close() {},
    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
