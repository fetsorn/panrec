import fs from 'fs';
import stream from 'stream';
import org from 'org-mode-parser';
import { URLSearchParams } from 'node:url';
import { readdir, stat } from 'fs/promises';

function tokenize(str) {
  return str
    .replace(/\(/g, '( ')
    .replace(/\)/g, ' )')
    .replace(/'/g, '')
    .split(/(\(|\)|:\w+|'[^']*')/g)
    .map(el => el.trim())
    .filter(el => el);
}

function astFromArray(tokens, ast = [[]]) {
  if (tokens.length === 0) {
    return ast.pop().pop();
  }

  const token = tokens.shift();

  if (token === '(') {
    ast.push([]);
  } else if (token === ')') {
    const list = ast.pop();

    ast[ast.length - 1].push(list);
  } else {
    ast[ast.length - 1].push(token);
  }

  return astFromArray(tokens, ast);
}

function convertToObject(arr) {
  const obj = {};

  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i].replace(':', '');

    const value = arr[i + 1];

    if (Array.isArray(value)) {
      if (Array.isArray(value[0])) {
        obj[key] = value.map(item => convertToObject(item));
      } else {
        obj[key] = convertToObject(value);
      }
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

async function parseOrgmode(sourcePath, stats) {
  return new Promise(res => {
    const entries = [];

    org.makelist(sourcePath, async nl => {
      nl.forEach(el => {
        const entry = {};

        entry._ = 'datum';

        const datumValue = el.body.trim();

        entry.datum = datumValue;
        Object.keys(el.properties).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(el.properties, key)) {
            const value = el.properties[key];

            if (value.startsWith('(:')) {
              entry[key] = convertToObject(astFromArray(tokenize(value)));
            } else {
              entry[key] = value;
            }
          }
        });
        if (stats) {
          entries.push(entry);
        } else {
          console.log(JSON.stringify(entry, null, 2));
        }
      });

      if (stats) {
        res(entries);
      }
    });
  });
}

async function biorgStats(sourcePath, query, stats) {
  if (stats) {
    const searchParams = new URLSearchParams(query);
    const entries = await parseOrgmode(sourcePath, stats);
    console.log(`entries: ${entries.length}`);
    printTree(entries);
  }

  const toStream = new stream.Readable({ objectMode: true });
  toStream.push(null);
  return toStream;
}

function printTree(obj, depth = 0, prefix = '') {
  if (depth === 0) {
    console.log(prefix + 'datum');
  }
  let keys = [];
  if (Array.isArray(obj)) {
    keys = Object.keys(obj[0]);
    obj = obj[0];
  } else {
    keys = Object.keys(obj);
  }
  keys.forEach(key => {
    if (key !== '_' && key !== 'datum') {
      const indent = '  '.repeat(depth + 1);
      if (key.toLowerCase() !== 'uuid') {
        console.log(prefix + indent + '|- ' + key);
      }

      if (typeof obj[key] === 'object' && Object.keys(obj[key]).length > 0) {
        printTree(obj[key], depth + 1);
      }
    }
  });
}

export default async function parseBiorg(sourcePath, stats, query) {
  if (stats) {
    return biorgStats(sourcePath, query, stats);
  } else {
    const entries = await parseOrgmode(sourcePath, false);
    const toStream = new stream.Readable({
      objectMode: true,
      read() {
        if (this.counter === undefined) {
          this.counter = 0;
        }
        this.push(entries[this.counter]);
        if (this.counter === entries.length - 1) {
          this.push(null);
        }
        this.counter += 1;
      },
    });
    return toStream;
  }
}
