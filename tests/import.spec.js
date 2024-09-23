/* eslint-disable no-console */
import { describe, beforeEach, expect, test } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import fs from "fs";
import crypto from "crypto";
import { ReadableStream, WritableStream } from "node:stream/web";
import { testCasesImport as testCases } from "./cases.js";
import readCSVS from "../src/import/csvs.js";
import { parseJSON, parseJSONStream } from "../src/import/json.js";
import parseVK from "../src/import/vk.js";
import parseTG from "../src/import/tg.js";
import parseFS from "../src/import/fs.js";
import parseBiorg from "../src/import/biorg.js";
import parseListing from "../src/import/listing.js";
import parseGEDCOM from "../src/import/gedcom.js";

let counter = 0;

// node polyfills for browser APIs
// used in csvs_js.digestMessage for hashes
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.crypto = {
  subtle: crypto.webcrypto.subtle,
  randomUUID: () => {
    counter += 1;

    return `${counter}`;
  },
};

let data = [];

const outputStream = () =>
  new WritableStream({
    async write(record) {
      data.push(record);
    },
  });

function sortRecords(a, b) {
  if (a._ !== b._) {
    return a._.localeCompare(b._);
  }

  if (a[a._] === undefined) {
    return 1;
  }

  if (b[b._] === undefined) {
    return -1;
  }

  return a[a._].localeCompare(b[b._]);
}

describe("import csvs", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().csvs.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await readCSVS(testCase.initial, testCase.query);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import json", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().json.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseJSON(testCase.initial);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });

  testCases().jsonStdout.forEach((testCase) => {
    test(testCase.name, async () => {
      const input = ReadableStream.from(
        fs.createReadStream(testCase.initial, "utf8"),
      );

      const importStream = await parseJSONStream();

      await input.pipeThrough(importStream).pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import vk", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().vk.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseVK(testCase.initial);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import tg", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().tg.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseTG(testCase.initial);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import fs", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().fs.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseFS(testCase.initial);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import biorg", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().biorg.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseBiorg(testCase.initial, testCase.query);

      await importStream.pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import listing", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().listing.forEach((testCase) => {
    test(testCase.name, async () => {
      const input = ReadableStream.from(
        fs.createReadStream(testCase.stdout, "utf8"),
      );

      const importStream = await parseListing(
        testCase.initial,
        testCase.query,
        true,
      );

      await input.pipeThrough(importStream).pipeTo(outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});

describe("import gedcom", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().gedcom.forEach((testCase) => {
    test(testCase.name, async () => {
      const importStream = await parseGEDCOM(testCase.initial);

      await importStream.pipeTo(outputStream());

      expect(data.sort(sortRecords)).toStrictEqual(
        testCase.expected.sort(sortRecords),
      );
    });
  });
});
