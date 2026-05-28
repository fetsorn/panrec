import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ReadableStream, WritableStream } from "node:stream/web";
import readCSVS from "../../../js/src/import/csvs.js";
import { parseJSON, parseJSONStream } from "../../../js/src/import/json.js";
import parseVK from "../../../js/src/import/vk.js";
import parseBiorg from "../../../js/src/import/biorg.js";
import parseListing from "../../../js/src/import/listing.js";
import parseGEDCOM from "../../../js/src/import/gedcom.js";

function outputStream(data) {
  return new WritableStream({
    async write(record) {
      data.push(record);
    },
  });
}

function sortRecords(a, b) {
  if (a._ !== b._) return a._.localeCompare(b._);
  if (a[a._] === undefined) return 1;
  if (b[b._] === undefined) return -1;
  return a[a._].localeCompare(b[b._]);
}

// -- Given --

Given("the default csvs dataset", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.datasetDefault;
  this.expected = [this.mocks.record2001];
});

Given("the default json file", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.jsonDefault;
  this.expected = [this.mocks.record2001];
});

Given("the default json stdout file", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.jsonStdoutDefault;
  this.expected = [this.mocks.record2001];
});

Given("the default vk archive", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.vkDefault;
  this.expected = this.mocks.recordsVK;
});

Given("the default biorg file", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.biorgDefault;
  this.expected = [this.mocks.record2001];
});

Given("the default listing directory", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.listingDefault;
  this.fixtureStdout = this.mocks.listingDefaultStdout;
  this.expected = [this.mocks.recordFileListing];
});

Given("the default gedcom file", function () {
  this.setupCryptoImport();
  this.fixture = this.mocks.gedcomDefault;
  this.expected = this.mocks.recordsPedigree;
});

// -- When --

When("I import from csvs with query {string}", async function (query) {
  this.data = [];
  const importStream = await readCSVS({
    sourcePath: this.fixture,
    searchParams: query,
    bare: true,
  });
  await importStream.pipeTo(outputStream(this.data));
});

When("I import from json", async function () {
  this.data = [];
  const importStream = await parseJSON(this.fixture);
  await importStream.pipeTo(outputStream(this.data));
});

When("I import from json stream", async function () {
  this.data = [];
  const input = ReadableStream.from(
    fs.createReadStream(this.fixture, "utf8"),
  );
  const importStream = await parseJSONStream();
  await input.pipeThrough(importStream).pipeTo(outputStream(this.data));
});

When("I import from vk", async function () {
  this.data = [];
  const importStream = await parseVK(this.fixture);
  await importStream.pipeTo(outputStream(this.data));
});

When("I import from biorg", async function () {
  this.data = [];
  const importStream = await parseBiorg(this.fixture);
  await importStream.pipeTo(outputStream(this.data));
});

When("I import from listing with query {string}", async function (query) {
  this.data = [];
  const input = ReadableStream.from(
    fs.createReadStream(this.fixtureStdout, "utf8"),
  );
  const importStream = await parseListing(this.fixture, query, true);
  await input.pipeThrough(importStream).pipeTo(outputStream(this.data));
});

When("I import from gedcom", async function () {
  this.data = [];
  const importStream = await parseGEDCOM(this.fixture);
  await importStream.pipeTo(outputStream(this.data));
});

// -- Then --

Then("the output matches the expected records", function () {
  assert.deepStrictEqual(this.data, this.expected);
});

Then("the sorted output matches the expected records", function () {
  assert.deepStrictEqual(
    this.data.sort(sortRecords),
    this.expected.sort(sortRecords),
  );
});
