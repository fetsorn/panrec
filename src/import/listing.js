import fs from "fs";
import os from "os";
import path from "path";
import stream from "stream";
import { URLSearchParams } from "node:url";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { digestMessage } from "@fetsorn/csvs-js";
import crypto from "crypto";

dayjs.extend(customParseFormat);

const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "csvs-"));

async function parseLine(sourcePath, searchParams, filePath, doHashsum) {
  const filename = sourcePath
    ? filePath.replace(`${sourcePath}`, "")
    : filePath;

  await fs.promises.appendFile(path.join(tmpdir, "log"), `${filename}\n`);

  const record = {
    _: "file",
    file: await digestMessage(filename),
    filename,
  };

  const fileAbsolutePath = `${sourcePath}/${filename}`;

  if (doHashsum) {
    const input = await fs.createReadStream(fileAbsolutePath);

    const hash = crypto.createHash("sha256");

    await stream.promises.pipeline(input, hash);

    const hashHex = hash.digest("hex");

    record.filehash = hashHex;
  }

  try {
    const stats = await fs.promises.stat(fileAbsolutePath);

    const date = dayjs(stats.mtime).format("YYYY-MM-DDTHH:mm:ss");

    record.moddate = date;
  } catch (e) {
    console.error(fileAbsolutePath, e);
  }

  let matchesQuery = true;

  searchParams.forEach((value, key) => {
    matchesQuery = record[key] === value;
  });

  if (matchesQuery) {
    return record;
  }

  return undefined;
}

export default async function parseListing(sourcePath, query, doHashsum) {
  const searchParams = new URLSearchParams(query);

  return new stream.Transform({
    objectMode: true,

    async transform(chunk, encoding, callback) {
      const content = (this.contentBuffer ?? "") + String(chunk);

      const lines = content.split("\n").filter((l) => l !== "");

      const tail = content[content.length - 1] === "\n" ? "" : lines.pop();

      this.contentBuffer = tail;

      await Promise.all(
        lines.map(async (line) => {
          const record = await parseLine(
            sourcePath,
            searchParams,
            line,
            doHashsum,
          );

          this.push(record);
        }),
      );

      callback();
    },

    async final(next) {
      if (this.contentBuffer) {
        const record = await parseLine(
          sourcePath,
          searchParams,
          this.contentBuffer,
          doHashsum,
        );

        this.push(JSON.stringify(record, 2));
      }

      next();
    },
  });
}
