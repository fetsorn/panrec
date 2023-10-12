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
    objectMode: true,

    // eslint-disable-next-line no-unused-vars
    async write(entry, encoding, next) {
      const entryNew = entry;

      Object.keys(entry)
        .filter((key) => key !== "datum")
        .forEach((key) => {
          entryNew[key] = objectToBiorgFormat(entry[key]);
        });

      console.log("* .");
      console.log(":PROPERTIES:");
      Object.entries(entry)
        .filter(([key]) => key !== "datum")
        .forEach(([key, value]) => {
          console.log(`:${key}:`, value);
        });
      console.log(":END:");
      console.log(entry.datum);
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });
}
