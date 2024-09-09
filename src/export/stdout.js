import { WritableStream } from "node:stream/web";
import process from "process";

export default function buildStdout() {
  return new WritableStream({
    objectMode: true,

    async write(entry) {
      const json = JSON.stringify(entry);

      process.stdout.write(`${json}\n`);
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
