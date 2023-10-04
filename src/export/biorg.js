import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
  function objectToBiorgFormat(entryValue) {
    if (typeof entryValue !== 'object' || entryValue === null) {
      return entryValue;
    }

    if (Array.isArray(entryValue)) {
      return `(${entryValue.map(objectToBiorgFormat).join(' ')})`;
    }

    const str = `(${Object.entries(entryValue)
      .map(([key, value]) => `:${key} ${objectToBiorgFormat(value)}`)
      .join(' ')})`;

    return `(${str})`;
  }

  return new WritableStream({
    objectMode: true,

    async write(entry, encoding, next) {
      for (const key of Object.keys(entry).filter(key => key !== 'datum')) {
        entry[key] = objectToBiorgFormat(entry[key]);
      }

      console.log(`* .`);
      console.log(`:PROPERTIES:`);
      for (const [key, value] of Object.entries(entry).filter(
        ([k, v]) => k !== 'datum'
      )) {
        console.log(`:${key}:`, value);
      }
      console.log(`:END:`);
      console.log(entry.datum);
    },

    close() {},

    abort(err) {
      console.log('Sink error:', err);
    },
  });
}
