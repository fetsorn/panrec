import stream from "stream";
import org from "org-mode-parser";

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
    const entries = [];

    org.makelist(sourcePath, async (nl) => {
      nl.forEach((el) => {
        const entry = {};

        entry._ = "datum";

        const datumValue = el.body.trim();

        entry.datum = datumValue;

        Object.keys(el.properties).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(el.properties, key)) {
            const value = el.properties[key];

            if (value.startsWith("(:")) {
              entry[key] = convertToObject(astFromArray(tokenize(value)));
            } else {
              entry[key] = value;
            }
          }
        });

        entries.push(entry);
      });

      res(entries);
    });
  });
}

function printTree(entries, depth = 0, prefix = "") {
  if (depth === 0) {
    console.log(`${prefix}datum`);
  }

  let keys = [];

  let entry = {};

  if (Array.isArray(entries)) {
    entries.forEach((e) => {
      if (Object.keys(e).length > Object.keys(entry).length) entry = e;
    });
    keys = Object.keys(entry);
  } else {
    entry = entries;

    keys = Object.keys(entries);
  }

  keys.forEach((key) => {
    if (key !== "_" && key !== "datum") {
      const indent = "  ".repeat(depth + 1);

      if (key.toLowerCase() !== "uuid") {
        console.log(`${prefix + indent}|- ${key}`);
      }

      if (
        typeof entry[key] === "object" &&
        Object.keys(entry[key]).length > 0
      ) {
        printTree(entry[key], depth + 1);
      }
    }
  });
}

async function biorgStats(sourcePath) {
  const entries = await parseOrgmode(sourcePath);

  console.log(`entries: ${entries.length}`);

  printTree(entries);

  const toStream = new stream.Readable({ objectMode: true });

  toStream.push(null);

  return toStream;
}

export default async function parseBiorg(sourcePath, query, stats) {
  if (stats) {
    return biorgStats(sourcePath);
  }

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
