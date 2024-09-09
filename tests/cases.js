import { loadMocks } from "./mocks/index.js";

const mocks = loadMocks();

export const testCasesImport = () => ({
  csvs: [
    {
      name: "default",
      query: "?_=event&actname=name1",
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
      expected: mocks.recordsVK,
    },
  ],
  tg: [
    {
      name: "default",
      initial: mocks.tgDefault,
      expected: mocks.recordsTG,
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
  gedcom: [
    {
      name: "default",
      initial: mocks.gedcomDefault,
      expected: mocks.recordsPedigree,
    },
  ],
});

export const testCasesExport = () => ({
  csvs: [
    {
      name: "default",
      target: mocks.datasetEmpty,
      initial: [mocks.record2001, mocks.record2002, mocks.record2003],
      expected: mocks.datasetDefault,
    },
  ],
  stdout: [
    {
      name: "default",
      initial: [mocks.record2001],
      expected: mocks.jsonStdoutDefault,
    },
  ],
  biorg: [
    {
      name: "default",
      initial: [mocks.record2001],
      expected: mocks.biorgDefault,
    },
  ],
  json: [
    {
      name: "default",
      target: "output.json",
      initial: [mocks.record2001],
      expected: mocks.jsonStdoutDefault,
    },
  ],
});
