import fs from "fs";
import path from "path";
import csvs from "@fetsorn/csvs-js";
import { readdir, stat } from "fs/promises";
import { ReadableStream } from "node:stream/web";

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
  const records = await csvs.selectRecord({
    fs,
    dir: sourcePath,
    query,
  });

  console.log(`records: ${records.length}`);

  // TODO update to csvs 0.0.2
  const size = await dirSize(sourcePath);

  console.log(`size: ${size} Kb`);

  // fs.readFile(`${sourcePath}/metadir.json`, "utf8", (err, data) => {
  //   const jsonData = JSON.parse(data);

  //   const buildNestedObject = (jd, parentTrunk) => {
  //     const result = {};

  //     Object.keys(jd).forEach((key) => {
  //       if (jd[key].trunk === parentTrunk) {
  //         result[key] = buildNestedObject(jd, key);
  //       }
  //     });

  //     return result;
  //   };

  //   const nestedObject = buildNestedObject(jsonData, "datum");

  //   const printTree = (obj, depth = 0) => {
  //     const keys = Object.keys(obj);

  //     if (depth === 0) {
  //       console.log("datum");
  //     }

  //     keys.forEach((key) => {
  //       const indent = "  ".repeat(depth + 1);

  //       console.log(`${indent}|- ${key}`);

  //       printTree(obj[key], depth + 1);
  //     });
  //   };

  //   printTree(nestedObject);
  // });

  const toStream = ReadableStream.from([]);

  return toStream;
}

export default async function readCSVS(sourcePath, searchParams, stats) {
  const [schemaRecord] = await csvs.selectSchema({
    fs,
    dir: sourcePath,
  });

  const schema = csvs.toSchema(schemaRecord);

  const query = csvs.searchParamsToQuery(schema, searchParams);

  if (stats) return csvsStats(sourcePath, query);

  const baseDefault = Object.keys(schema)
    .filter((key) => key !== "branch")
    .find((key) => schema[key] === undefined);

  const base = query._ !== undefined ? query._ : baseDefault;

  const queryStream = await csvs.selectRecordStream({
    fs,
    dir: sourcePath,
    query: { _: base, ...query },
  });

  return queryStream;
}
