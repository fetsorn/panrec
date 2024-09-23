/* eslint-disable no-console */
import { describe, beforeEach, expect, test, jest } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
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

function sortContent(content) {
  const lines = content.split("\n");

  const sorted = lines.sort().join("\n");

  return sorted;
}

describe("export csvs", () => {
  testCases().csvs.forEach((testCase) => {
    test(testCase.name, async () => {
      const tmpdir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "csvs-nodejs-test"),
      );

      await fs.promises.cp(testCase.target, tmpdir, { recursive: true });

      const input = ReadableStream.from(testCase.initial);

      const exportStream = await exportCSVS(tmpdir);

      await input.pipeTo(exportStream);

      const files = await fs.promises.readdir(tmpdir);

      await Promise.all(
        files
          .filter((file) => file !== ".DS_Store")
          .map(async (file) => {
            const content = await fs.promises.readFile(
              path.join(tmpdir, file),
              "utf8",
            );

            const expected = await fs.promises.readFile(
              path.join(testCase.expected, file),
              "utf8",
            );

            expect(sortContent(content)).toStrictEqual(sortContent(expected));
          }),
      );
    });
  });
});

describe("export stdout", () => {
  testCases().stdout.forEach((testCase) => {
    test(testCase.name, async () => {
      let output = "";

      jest.spyOn(process.stdout, "write").mockImplementation((s) => {
        output += s;
      });

      const input = ReadableStream.from(testCase.initial);

      const exportStream = await exportStdout();

      await input.pipeTo(exportStream);

      jest.clearAllMocks();

      const expected = await fs.promises.readFile(testCase.expected, "utf8");

      expect(output).toStrictEqual(expected);
    });
  });
});

describe("export biorg", () => {
  testCases().biorg.forEach((testCase) => {
    test(testCase.name, async () => {
      let output = "";

      jest.spyOn(process.stdout, "write").mockImplementation((s) => {
        output += s;
      });

      const input = ReadableStream.from(testCase.initial);

      const exportStream = await exportBiorg();

      await input.pipeTo(exportStream);

      jest.clearAllMocks();

      const expected = await fs.promises.readFile(testCase.expected, "utf8");

      expect(output).toStrictEqual(expected);
    });
  });
});

describe("export json", () => {
  testCases().json.forEach((testCase) => {
    test(testCase.name, async () => {
      const tmpdir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "csvs-nodejs-test"),
      );

      const output = path.join(tmpdir, testCase.target);

      const input = ReadableStream.from(testCase.initial);

      const exportStream = await exportJSON(output);

      await input.pipeTo(exportStream);

      const content = await fs.promises.readFile(output, "utf8");

      const expected = await fs.promises.readFile(testCase.expected, "utf8");

      expect(sortContent(content)).toStrictEqual(sortContent(expected));
    });
  });
});
