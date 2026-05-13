import { WritableStream } from "node:stream/web";

export default function buildBiorg() {
  function objectToBiorgFormat(entryValue) {
    if (typeof entryValue !== "object" || entryValue === null) {
      return entryValue;
    }

    if (Array.isArray(entryValue)) {
      return `(${entryValue.map(objectToBiorgFormat).join(" ")})`;
    }

    const str = `(${Object.entries(entryValue)
      .map(([key, value]) => `:${key} ${objectToBiorgFormat(value)}`)
      .join(" ")})`;

    return `${str}`;
  }

  return new WritableStream({
    // eslint-disable-next-line no-unused-vars
    async write(entry, encoding, next) {
      const entryNew = JSON.parse(JSON.stringify(entry));

      Object.keys(entry)
        .filter((key) => key !== entry.__)
        .forEach((key) => {
          entryNew[key] = objectToBiorgFormat(entry[key]);
        });

      process.stdout.write("* .\n");

      process.stdout.write(":PROPERTIES:\n");

      Object.entries(entryNew)
        .filter(([key]) => key !== entryNew.__)
        .forEach(([key, value]) => {
          process.stdout.write(`:${key}: ${value}\n`);
        });

      process.stdout.write(":END:\n");

      if (entryNew[entryNew.__] !== undefined) {
        process.stdout.write(`${entryNew[entryNew.__]}\n`);
      }
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
