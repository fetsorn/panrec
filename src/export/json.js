import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
  return new WritableStream({
    objectMode: true,

    async write(entry, encoding, next) {
      // TODO: preserve json format after append
      await fs.promises.appendFile(targetPath, JSON.stringify(entry))
    },

    close() {
    },

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
