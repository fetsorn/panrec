import { ReadableStream, TransformStream } from "node:stream/web";
import fs from "fs";

export async function parseJSON(sourcePath) {
  const index = await fs.promises.readFile(sourcePath);

  // TODO filter query
  const records = JSON.parse(index);

  const toStream = ReadableStream.from(records);

  return toStream;
}

export async function parseJSONStream() {
  return new TransformStream({
    async transform(chunk, controller) {
      const content = (this.contentBuffer ?? "") + String(chunk);

      const lines = content.split("\n").filter((l) => l !== "");

      const tail = content[content.length - 1] === "\n" ? "" : lines.pop();

      this.contentBuffer = tail;

      await Promise.all(
        lines.map(async (line) => {
          controller.enqueue(JSON.parse(line));
        }),
      );
    },

    async flush(controller) {
      if (this.contentBuffer) {
        controller.enqueue(JSON.parse(this.contentBuffer));
      }
    },
  });
}
