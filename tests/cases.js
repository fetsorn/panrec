import { loadMocks } from "./mocks/index.js";

const mocks = loadMocks();

export const testCasesImport = () => ({
  csvs: [
    {
      name: "default",
      query: "?_=datum&actname=name1",
      initial: mocks.datasetDefault,
      expected: [mocks.record2001],
    },
  ],
  json: [
    {
      name: "default",
      initial: mocks.jsonDefault,
      expected: [mocks.record2001],
    },
  ],
  jsonStdout: [
    {
      name: "default",
      initial: mocks.jsonStdoutDefault,
      expected: [mocks.record2001],
    },
  ],
  vk: [
    {
      name: "default",
      initial: mocks.vkDefault,
      expected: [],
    },
  ],
  tg: [
    {
      name: "default",
      initial: mocks.tgDefault,
      expected: [],
    },
  ],
  fs: [
    {
      name: "default",
      initial: mocks.fsDefault,
      expected: [mocks.recordFile],
    },
  ],
  biorg: [
    {
      name: "default",
      initial: mocks.biorgDefault,
      expected: [mocks.record2001],
    },
  ],
  listing: [
    {
      name: "default",
      query: "?",
      initial: mocks.listingDefault,
      stdout: mocks.listingDefaultStdout,
      expected: [mocks.recordFileListing],
    },
  ],
});

export const testCasesExport = () => ({
  csvs: [
    {
      name: "default",
      initial: mocks.biorgDefault,
      expected: [mocks.record2001],
    },
  ],
  stdout: [
    {
      name: "default",
      initial: mocks.biorgDefault,
      expected: [mocks.record2001],
    },
  ],
  biorg: [
    {
      name: "default",
      initial: mocks.biorgDefault,
      expected: [mocks.record2001],
    },
  ],
  json: [
    {
      name: "default",
      initial: mocks.biorgDefault,
      expected: [mocks.record2001],
    },
  ],
});
