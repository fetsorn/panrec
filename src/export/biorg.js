import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
  function objectToBiorgFormat(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return `(${obj.map(objectToBiorgFormat).join(' ')})`;
    }
    const keyValuePairs = Object.entries(obj)
      .map(([key, value]) => `:${key} ${objectToBiorgFormat(value)}`)
      .join(' ');
    return `(:_ '${obj._}' ${keyValuePairs})`;
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
