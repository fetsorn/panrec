import { WritableStream } from "node:stream/web";

export default function buildStdout() {
  return new WritableStream({
    objectMode: true,

    async write(entry) {
      console.log(JSON.stringify(entry));
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
