import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ReadableStream } from "node:stream/web";
import exportCSVS from "../../../js/src/export/csvs.js";
import exportStdout from "../../../js/src/export/stdout.js";
import exportBiorg from "../../../js/src/export/biorg.js";
import exportJSON from "../../../js/src/export/json.js";

function sortContent(content) {
  return content.split("\n").sort().join("\n");
}

// -- Given --

Given("records to export to csvs", function () {
  this.setupCryptoExport();
  this.records = [this.mocks.record2001, this.mocks.record2002, this.mocks.record2003];
  this.target = this.mocks.datasetEmpty;
  this.expected = this.mocks.datasetDefault;
});

Given("a record to export to stdout", function () {
  this.setupCryptoExport();
  this.records = [this.mocks.record2001];
  this.expected = this.mocks.jsonStdoutDefault;
});

Given("a record to export to biorg", function () {
  this.setupCryptoExport();
  this.records = [this.mocks.record2001];
  this.expected = this.mocks.biorgDefault;
});

Given("a record to export to json", function () {
  this.setupCryptoExport();
  this.records = [this.mocks.record2001];
  this.target = "output.json";
  this.expected = this.mocks.jsonStdoutDefault;
});

// -- When --

When("I export to csvs", async function () {
  this.createTmpdir();
  await fs.promises.cp(this.target, this.tmpdir, { recursive: true });
  const input = ReadableStream.from(this.records);
  const exportStream = await exportCSVS(this.tmpdir);
  await input.pipeTo(exportStream);
});

When("I export to stdout", async function () {
  this.stdoutOutput = "";
  const origWrite = process.stdout.write;
  process.stdout.write = (s) => {
    this.stdoutOutput += s;
    return true;
  };
  try {
    const input = ReadableStream.from(this.records);
    const exportStream = await exportStdout();
    await input.pipeTo(exportStream);
  } finally {
    process.stdout.write = origWrite;
  }
});

When("I export to biorg", async function () {
  this.stdoutOutput = "";
  const origWrite = process.stdout.write;
  process.stdout.write = (s) => {
    this.stdoutOutput += s;
    return true;
  };
  try {
    const input = ReadableStream.from(this.records);
    const exportStream = await exportBiorg();
    await input.pipeTo(exportStream);
  } finally {
    process.stdout.write = origWrite;
  }
});

When("I export to json", async function () {
  this.createTmpdir();
  this.jsonOutputPath = path.join(this.tmpdir, this.target);
  const input = ReadableStream.from(this.records);
  const exportStream = await exportJSON(this.jsonOutputPath);
  await input.pipeTo(exportStream);
});

// -- Then --

Then("the csvs output matches the expected dataset", async function () {
  const files = await fs.promises.readdir(this.tmpdir);
  for (const file of files.filter((f) => f !== ".DS_Store")) {
    const content = await fs.promises.readFile(
      path.join(this.tmpdir, file),
      "utf8",
    );
    const expected = await fs.promises.readFile(
      path.join(this.expected, file),
      "utf8",
    );
    assert.equal(sortContent(content), sortContent(expected));
  }
});

Then("the stdout output matches the expected file", async function () {
  const expected = await fs.promises.readFile(this.expected, "utf8");
  assert.equal(this.stdoutOutput, expected);
});

Then("the json output matches the expected file", async function () {
  const content = await fs.promises.readFile(this.jsonOutputPath, "utf8");
  const expected = await fs.promises.readFile(this.expected, "utf8");
  assert.equal(sortContent(content), sortContent(expected));
});
