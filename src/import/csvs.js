import fs from "fs";
import path from "path";
import stream from "stream";
import { spawn } from "child_process";
import { URLSearchParams } from "node:url";
import { CSVS } from "@fetsorn/csvs-js";
import { readdir, stat } from "fs/promises";

// TODO: add WASM fallback
async function grepCallback(contentFile, patternFile, isInverse) {
  const contentFilePath = `/tmp/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/${crypto.randomUUID()}`;

  const outputFilePath = `/tmp/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  const outputStream = fs.createWriteStream(outputFilePath);

  try {
    await new Promise((res, rej) => {
      const cmd = "/Users/fetsorn/.nix-profile/bin/rg";

      const flags = (isInverse ? ["-v"] : []).concat([
        "-f",
        patternFilePath,
        contentFilePath,
      ]);

      const top = spawn(cmd, flags);

      top.stdout.on("data", (data) => {
        outputStream.write(data);
      });

      top.stderr.on("data", (data) => {
        rej(data.toString());
      });

      top.on("close", () => {
        res();
      });
    });
  } catch (e) {
    console.log(e);
  }

  const output = await fs.promises.readFile(outputFilePath, {
    encoding: "utf8",
  });

  await fs.promises.unlink(contentFilePath);

  await fs.promises.unlink(patternFilePath);

  await fs.promises.unlink(outputFilePath);

  return output;
}

async function fetchCallback(filepath) {
  try {
    return fs.promises.readFile(filepath, { encoding: "utf8" });
  } catch {
    throw ("couldn't find file", filepath);
  }
}

const dirSize = async (dir) => {
  const files = await readdir(dir, { withFileTypes: true });

  const paths = files.map(async (file) => {
    const dirPath = path.join(dir, file.name);

    if (file.isDirectory()) return dirSize(dirPath);

    if (file.isFile()) {
      const { size } = await stat(dirPath);

      return size;
    }

    return 0;
  });

  return (await Promise.all(paths))
    .flat(Infinity)
    .reduce((i, size) => i + size, 0);
};

async function csvsStats(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  const csvs = new CSVS({
    readFile: async (filepath) =>
      fetchCallback(path.join(sourcePath, filepath)),
    grep: grepCallback,
  });

  const records = await csvs.select(searchParams);

  console.log(`records: ${records.length}`);

  const size = await dirSize(`${sourcePath}/metadir`);

  console.log(`size: ${size} Kb`);

  fs.readFile(`${sourcePath}/metadir.json`, "utf8", (err, data) => {
    const jsonData = JSON.parse(data);

    const buildNestedObject = (jd, parentTrunk) => {
      const result = {};

      Object.keys(jd).forEach((key) => {
        if (jd[key].trunk === parentTrunk) {
          result[key] = buildNestedObject(jd, key);
        }
      });

      return result;
    };

    const nestedObject = buildNestedObject(jsonData, "datum");

    const printTree = (obj, depth = 0) => {
      const keys = Object.keys(obj);

      if (depth === 0) {
        console.log("datum");
      }

      keys.forEach((key) => {
        const indent = "  ".repeat(depth + 1);

        console.log(`${indent}|- ${key}`);

        printTree(obj[key], depth + 1);
      });
    };

    printTree(nestedObject);
  });

  const toStream = new stream.Readable({ objectMode: true });

  toStream.push(null);

  return toStream;
}

export default async function readCSVS(sourcePath, query, stats) {
  if (stats) return csvsStats(sourcePath);

  const searchParams = new URLSearchParams(query);

  const csvs = new CSVS({
    readFile: async (filepath) =>
      fetchCallback(path.join(sourcePath, filepath)),
    grep: grepCallback,
  });

  // if base is undefined, find first root
  if (
    searchParams.get("_") === null &&
    (await csvs.detectVersion()) === "0.0.2"
  ) {
    // TODO this is specific to csvs 2, csvs 1 finds its own default base
    const [schemaRecord] = await csvs.select(new URLSearchParams("_=_"));

    // { leaf: trunk, root: undefined }
    const schema = Object.keys(schemaRecord)
      .filter((key) => key !== "_")
      .reduce(
        (accTrunk, trunk) => ({
          ...accTrunk,
          ...schemaRecord[trunk].reduce(
            (accLeaf, leaf) => ({ ...accLeaf, [leaf]: trunk }),
            { [trunk]: undefined, ...accTrunk },
          ),
        }),
        {},
      );

    // find first branch that has no trunk
    const baseDefault = Object.keys(schema)
      .filter((key) => key !== "branch")
      .find((key) => schema[key] === undefined);

    searchParams.set("_", baseDefault);
  }

  const queryStream = await csvs.selectStream(searchParams);

  return queryStream;
}
