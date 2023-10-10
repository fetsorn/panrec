import fs from "fs";

export default function buildJson(targetPath) {
  return new WritableStream({
    objectMode: true,

    // eslint-disable-next-line no-unused-vars
    async write(entry, encoding, next) {
      // TODO: preserve json format after append
      await fs.promises.appendFile(targetPath, JSON.stringify(entry));
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
