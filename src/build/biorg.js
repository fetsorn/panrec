import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
  return new WritableStream({
    objectMode: true,
    async write(entry, encoding, next) {
      await fs.promises.appendFile(targetPath, `* .\n${entry.datum}`)
    },
    close() {
    },
    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
