import fs from "fs";
import { WritableStream } from "node:stream/web";

export default function buildJson(targetPath) {
  return new WritableStream({
    // eslint-disable-next-line no-unused-vars
    async write(entry, encoding, next) {
      // TODO: preserve json format after append
      await fs.promises.appendFile(targetPath, `${JSON.stringify(entry)}\n`);
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
