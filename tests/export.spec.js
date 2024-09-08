/* eslint-disable no-console */
import { describe, beforeEach, expect, test } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { ReadableStream } from "node:stream/web";
import { testCasesExport as testCases } from "./cases.js";
import exportCSVS from "../src/export/csvs.js";
import exportStdout from "../src/export/stdout.js";
import exportBiorg from "../src/export/biorg.js";
import exportJSON from "../src/export/json.js";

// node polyfills for browser APIs
// used in csvs_js.digestMessage for hashes
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.crypto = {
  subtle: crypto.webcrypto.subtle,
  randomUUID: crypto.randomUUID,
};

describe("export csvs", () => {
  testCases().csvs.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        ReadableStream.from(testCase.initial),
        await exportCSVS(testCase.initial),
      );

      expect([]).toStrictEqual(testCase.expected);
    });
  });
});

describe("export stdout", () => {
  testCases().stdout.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        ReadableStream.from(testCase.initial),
        await exportStdout(testCase.initial),
      );

      expect([]).toStrictEqual(testCase.expected);
    });
  });
});

describe("export biorg", () => {
  testCases().biorg.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        ReadableStream.from(testCase.initial),
        await exportBiorg(testCase.initial),
      );

      expect([]).toStrictEqual(testCase.expected);
    });
  });
});

describe("export json", () => {
  testCases().json.forEach((testCase) => {
    test(testCase.name, async () => {
      await pipeline(
        ReadableStream.from(testCase.initial),
        await exportJSON(testCase.initial),
      );

      expect([]).toStrictEqual(testCase.expected);
    });
  });
});
