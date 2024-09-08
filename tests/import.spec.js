/* eslint-disable no-console */
import { describe, beforeEach, expect, test } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { WritableStream } from "node:stream/web";
import { testCasesImport as testCases } from "./cases.js";
import readCSVS from "../src/import/csvs.js";
import { parseJSON, parseJSONStream } from "../src/import/json.js";
import parseVK from "../src/import/vk.js";
import parseTG from "../src/import/tg.js";
import parseFS from "../src/import/fs.js";
import parseBiorg from "../src/import/biorg.js";
import parseListing from "../src/import/listing.js";

// node polyfills for browser APIs
// used in csvs_js.digestMessage for hashes
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.crypto = {
  subtle: crypto.webcrypto.subtle,
  randomUUID: crypto.randomUUID,
};

let data = [];

const outputStream = () =>
  new WritableStream({
    objectMode: true,

    async write(entry) {
      data.push(entry);
    },

    close() {},

    abort(err) {
      console.log("Sink error:", err);
    },
  });

describe("import csvs", () => {
  beforeEach(() => {
    data = [];
  });

  testCases().csvs.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        await readCSVS(testCase.initial, testCase.query),
        outputStream(),
      );

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
      await pipeline(await parseJSON(testCase.initial), outputStream());

      expect(data).toStrictEqual(testCase.expected);
    });
  });

  testCases().jsonStdout.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        fs.createReadStream(testCase.initial, "utf8"),
        await parseJSONStream(),
        outputStream(),
      );

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
      await pipeline(await parseVK(testCase.initial), outputStream());

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
      await pipeline(await parseTG(testCase.initial), outputStream());

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
      await pipeline(await parseFS(testCase.initial), outputStream());

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
      await pipeline(
        await parseBiorg(testCase.initial, testCase.query),
        outputStream(),
      );

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
      await pipeline(
        fs.createReadStream(testCase.stdout, "utf8"),
        await parseListing(testCase.initial, testCase.query, true),
        outputStream(),
      );

      expect(data).toStrictEqual(testCase.expected);
    });
  });
});
