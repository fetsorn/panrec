import fs from "fs";
import path from "path";
import stream from "stream";
import crypto from "crypto";
import { URLSearchParams } from "node:url";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

async function statPath(
  sourceAbsolutePath,
  relativePath,
  searchParams,
  doHashsum,
) {
  const absolutePath = path.join(sourceAbsolutePath, relativePath);

  const files = await fs.promises.readdir(absolutePath);

  return Promise.all(
    files.map(async (file) => {
      const fileRelativePath = path.join(relativePath, file);

      const fileAbsolutePath = path.join(sourceAbsolutePath, fileRelativePath);

      const stats = await fs.promises.stat(fileAbsolutePath);

      if (stats.isDirectory()) {
        return statPath(
          sourceAbsolutePath,
          fileRelativePath,
          searchParams,
          doHashsum,
        );
      }

      const record = {
        _: "filepath",
        filepath: fileRelativePath,
        sourcepath: sourceAbsolutePath,
      };

      if (doHashsum) {
        try {
          const input = await fs.createReadStream(fileAbsolutePath);

          const hash = crypto.createHash("sha256");

          await stream.promises.pipeline(input, hash);

          const hashHex = hash.digest("hex");

          record.filehash = hashHex;
        } catch (e) {
          console.error(fileAbsolutePath, e);
        }
      }

      const moddate = dayjs(stats.mtime).format("YYYY-MM-DDTHH:mm:ss");

      record.moddate = moddate;

      let matchesQuery = true;

      searchParams.forEach((value, key) => {
        matchesQuery = record[key] === value;
      });

      if (matchesQuery) {
        return record;
      }

      return undefined;
    }),
  );
}

export default async function parseFS(sourcePath, query, doHashsum) {
  const searchParams = new URLSearchParams(query);

  const records = (
    await statPath(sourcePath, "", searchParams, doHashsum)
  ).flat();

  const toStream = new stream.Readable({
    objectMode: true,

    read() {
      if (this.counter === undefined) {
        this.counter = 0;
      }

      this.push(records[this.counter]);

      if (this.counter === records.length - 1) {
        this.push(null);
      }

      this.counter += 1;
    },
  });

  return toStream;
}
