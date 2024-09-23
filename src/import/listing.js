import { ReadableStream, TransformStream } from "node:stream/web";
import { Duplex } from "node:stream";
import fs from "fs";
import os from "os";
import path from "path";
import { URLSearchParams } from "node:url";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import crypto from "crypto";

dayjs.extend(customParseFormat);

const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "csvs-"));

async function parseLine(sourcePath, searchParams, filePath, doHashsum) {
  const filename = sourcePath
    ? filePath.replace(`${sourcePath}`, "")
    : filePath;

  await fs.promises.appendFile(path.join(tmpdir, "log"), `${filename}\n`);

  const record = {
    _: "filepath",
    filepath: filename,
  };

  const fileAbsolutePath = path.join(sourcePath, filename);

  if (doHashsum) {
    const input = ReadableStream.from(fs.createReadStream(fileAbsolutePath));

    const hash = crypto.createHash("sha256");

    const { writable, readable } = Duplex.toWeb(hash);

    await input.pipeTo(writable);

    const hashHex = hash.digest("hex");

    record.filehash = hashHex;
  }

  try {
    const stats = await fs.promises.stat(fileAbsolutePath);

    const date = dayjs(stats.mtime).format("YYYY-MM-DDTHH:mm:ss");

    record.moddate = date;

    record.filesize = JSON.stringify(stats.size);
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

  return new TransformStream({
    async transform(chunk, controller) {
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

          controller.enqueue(record);
        }),
      );
    },

    async flush(controller) {
      if (this.contentBuffer) {
        const record = await parseLine(
          sourcePath,
          searchParams,
          this.contentBuffer,
          doHashsum,
        );

        controller.enqueue(JSON.stringify(record, 2));
      }
    },
  });
}
