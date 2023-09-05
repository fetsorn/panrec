import fs from 'fs';
import path from 'path';

export function buildStdout() {
  return new WritableStream({
    objectMode: true,

    async write(entry, encoding, next) {
      console.log(JSON.stringify(entry, 2));
    },

    close() {
    },

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
