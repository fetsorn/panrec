import fs from "fs";
import stream from "stream";

export async function parseJSON(sourcePath) {
  const index = await fs.promises.readFile(sourcePath);

  // TODO filter query
  const records = JSON.parse(index);

  const toStream = stream.Readable.from(records);

  return toStream;
}

export async function parseJSONStream() {
  return new stream.Transform({
    objectMode: true,

    async transform(chunk, encoding, callback) {
      const content = (this.contentBuffer ?? "") + String(chunk);

      const lines = content.split("\n").filter((l) => l !== "");

      const tail = content[content.length - 1] === "\n" ? "" : lines.pop();

      this.contentBuffer = tail;

      await Promise.all(
        lines.map(async (line) => {
          this.push(JSON.parse(line));
        }),
      );

      callback();
    },

    async final(next) {
      if (this.contentBuffer) {
        this.push(JSON.parse(this.contentBuffer));
      }

      next();
    },
  });
}
