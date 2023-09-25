import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import { Iconv } from 'iconv';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import org from 'org-mode-parser';

export async function parseBiorg(sourcePath, query) {
  const tokenize = str =>
    str
      .replace(/\(/g, '( ')
      .replace(/\)/g, ' )')
      .replace(/\'/g, '')
      .split(/(\(|\)|:\w+|'[^']*')/g)
      .map(el => el.trim())
      .filter(el => el);

  const astFromArray = (tokens, ast = [[]]) => {
    if (tokens.length == 0) {
      return ast.pop().pop();
    }

    let token = tokens.shift();

    if (token == '(') {
      ast.push([]);
    } else if (token == ')') {
      let list = ast.pop();
      ast[ast.length - 1].push(list);
    } else {
      ast[ast.length - 1].push(token);
    }

    return astFromArray(tokens, ast);
  };

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

  org.makelist(sourcePath, function (nl) {
    const result = nl.map(el => {
      const obj = {};
      obj['_'] = 'datum';
      const datumValue = el.body.trim();
      obj.datum = datumValue;
      for (const key in el.properties) {
        if (el.properties.hasOwnProperty(key)) {
          const value = el.properties[key];
          if (value.startsWith('(:')) {
            obj[key] = convertToObject(astFromArray(tokenize(value)));
          } else {
            obj[key] = value;
          }
        }
      }
      return obj;
    });
    console.log(JSON.stringify(result));
  });

  try {
    const toStream = new stream.Readable({ objectMode: true });

    toStream.push(null);

    return toStream;
  } catch (e) {
    console.log('parseBiorg', e);
  }
}
