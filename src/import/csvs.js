import fs from "fs";
import path from "path";
import csvs from "@fetsorn/csvs-js";
import { readdir, stat } from "fs/promises";
import { ReadableStream } from "node:stream/web";
import { URLSearchParams } from "node:url";

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

//async function csvsStats(sourcePath, query) {
//  const records = await csvs.selectRecord({
//    fs,
//    dir: sourcePath,
//    query,
//  });
//
//  console.log(`records: ${records.length}`);
//
//  // TODO update to csvs 0.0.2
//  const size = await dirSize(sourcePath);
//
//  console.log(`size: ${size} Kb`);
//
//  // fs.readFile(`${sourcePath}/metadir.json`, "utf8", (err, data) => {
//  //   const jsonData = JSON.parse(data);
//
//  //   const buildNestedObject = (jd, parentTrunk) => {
//  //     const result = {};
//
//  //     Object.keys(jd).forEach((key) => {
//  //       if (jd[key].trunk === parentTrunk) {
//  //         result[key] = buildNestedObject(jd, key);
//  //       }
//  //     });
//
//  //     return result;
//  //   };
//
//  //   const nestedObject = buildNestedObject(jsonData, "datum");
//
//  //   const printTree = (obj, depth = 0) => {
//  //     const keys = Object.keys(obj);
//
//  //     if (depth === 0) {
//  //       console.log("datum");
//  //     }
//
//  //     keys.forEach((key) => {
//  //       const indent = "  ".repeat(depth + 1);
//
//  //       console.log(`${indent}|- ${key}`);
//
//  //       printTree(obj[key], depth + 1);
//  //     });
//  //   };
//
//  //   printTree(nestedObject);
//  // });
//
//  const toStream = ReadableStream.from([]);
//
//  return toStream;
//}

/**
 * This returns an array of records from the dataset.
 * @name searchParamsToQuery
 * @export function
 * @param {URLSearchParams} urlSearchParams - search params from a query string.
 * @returns {Object}
 */
export function searchParamsToQuery(schema, searchParams) {
  // TODO rewrite to schemaRecord
  const urlSearchParams = new URLSearchParams(searchParams.toString());

  if (!urlSearchParams.has("_")) return {};

  const base = urlSearchParams.get("_");

  urlSearchParams.delete("_");

  urlSearchParams.delete("__");

  const entries = Array.from(urlSearchParams.entries());

  // TODO: if key is leaf, add it to value of trunk
  const query = entries.reduce(
    (acc, [branch, value]) => {
      // TODO: can handly only two levels of nesting, suffices for compatibility
      // push to [trunk]: { [key]: [ value ] }

      const trunk1 =
        schema[branch] !== undefined ? schema[branch].trunks[0] : undefined;

      if (trunk1 === base || branch === base) {
        return { ...acc, [branch]: value };
      }

      const trunk2 =
        schema[trunk1] !== undefined ? schema[trunk1].trunks[0] : undefined;

      if (trunk2 === base) {
        const trunk1Record = acc[trunk1] ?? { _: trunk1 };

        return { ...acc, [trunk1]: { ...trunk1Record, [branch]: value } };
      }

      const trunk3 =
        schema[trunk2] !== undefined ? schema[trunk2].trunks[0] : undefined;

      if (trunk3 === base) {
        const trunk2Record = acc[trunk2] ?? { _: trunk2 };

        const trunk1Record = trunk2Record[trunk1] ?? { _: trunk1 };

        return {
          ...acc,
          [trunk2]: {
            ...trunk2Record,
            [trunk1]: {
              ...trunk1Record,
              [branch]: value,
            },
          },
        };
      }

      return acc;
    },
    { _: base },
  );

  return query;
}

export default async function readCSVS(sourcePath, searchParams, stats) {
  const [schemaRecord] = await csvs.selectSchema({
    fs,
    dir: sourcePath,
  });

  const schema = csvs.toSchema(schemaRecord);

  const query = searchParamsToQuery(schema, searchParams);

  // TODO notify is the query is empty

  const baseDefault = Object.keys(schema)
    .filter((key) => key !== "branch")
    .find((key) => schema[key] === undefined);

  const base = query._ !== undefined ? query._ : baseDefault;

  const queryStream = new ReadableStream({
    start(controller) {
      controller.enqueue({ _: base, ...query });

      controller.close();
    },
  });

  // if (stats) return csvsStats(sourcePath, query);

  // this is a transform
  const recordStream = await csvs.selectRecordStream({
    fs,
    dir: sourcePath,
  });

  return queryStream.pipeThrough(recordStream);
}
