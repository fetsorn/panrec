import org from "org-mode-parser";
import { ReadableStream } from "node:stream/web";

function tokenize(str) {
  return str
    .replace(/\(/g, "( ")
    .replace(/\)/g, " )")
    .replace(/'/g, "")
    .split(/(\(|\)|:\w+|'[^']*')/g)
    .map((el) => el.trim())
    .filter((el) => el);
}

function astFromArray(tokens, ast = [[]]) {
  if (tokens.length === 0) {
    return ast.pop().pop();
  }

  const token = tokens.shift();

  if (token === "(") {
    ast.push([]);
  } else if (token === ")") {
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
    const key = arr[i].replace(":", "");

    const value = arr[i + 1];

    if (Array.isArray(value)) {
      if (Array.isArray(value[0])) {
        obj[key] = value.map((item) => convertToObject(item));
      } else {
        obj[key] = convertToObject(value);
      }
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

async function parseOrgmode(sourcePath) {
  return new Promise((res) => {
    const records = [];

    org.makelist(sourcePath, async (nl) => {
      nl.forEach((el) => {
        const record = {};

        record._ = el.properties._;

        const valueBody = el.body.trim();

        record[record._] = valueBody;

        Object.keys(el.properties).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(el.properties, key)) {
            const valueProperty = el.properties[key];

            if (valueProperty.startsWith("(:")) {
              record[key] = convertToObject(
                astFromArray(tokenize(valueProperty)),
              );
            } else {
              record[key] = valueProperty;
            }
          }
        });

        records.push(record);
      });

      res(records);
    });
  });
}

function printTree(records, depth = 0, prefix = "") {
  if (depth === 0) {
    console.log(`${prefix}$_`);
  }

  let keys = [];

  let record = {};

  if (Array.isArray(records)) {
    records.forEach((e) => {
      if (Object.keys(e).length > Object.keys(record).length) record = e;
    });
    keys = Object.keys(record);
  } else {
    record = records;

    keys = Object.keys(records);
  }

  keys.forEach((key) => {
    if (key !== "_" && key !== [records._]) {
      const indent = "  ".repeat(depth + 1);

      if (key.toLowerCase() !== records._) {
        console.log(`${prefix + indent}|- ${key}`);
      }

      if (
        typeof record[key] === "object" &&
        Object.keys(record[key]).length > 0
      ) {
        printTree(record[key], depth + 1);
      }
    }
  });
}

async function biorgStats(sourcePath) {
  const records = await parseOrgmode(sourcePath);

  console.log(`records: ${records.length}`);

  printTree(records);

  const toStream = ReadableStream.from([]);

  return toStream;
}

export default async function parseBiorg(sourcePath, query, stats) {
  if (stats) {
    return biorgStats(sourcePath);
  }

  const records = await parseOrgmode(sourcePath, false);

  const toStream = ReadableStream.from(records);

  return toStream;
}
