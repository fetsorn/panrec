import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import records from "./records.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findpath(loadname) {
  const loadpath = path.join(__dirname, loadname);

  return loadpath;
}

export function loadMocks() {
  return {
    datasetDefault: findpath("csvs/default"),
    datasetEmpty: findpath("csvs/empty"),
    jsonDefault: findpath("json/default.json"),
    jsonStdoutDefault: findpath("jsonStdout/default.txt"),
    vkDefault: findpath("vk/default"),
    tgDefault: findpath("tg/default"),
    fsDefault: findpath("fs/default"),
    biorgDefault: findpath("biorg/default.bi.org"),
    listingDefault: findpath("listing"),
    listingDefaultStdout: findpath("listing/default.txt"),
    gedcomDefault: findpath("gedcom/default.ged"),
    ...records,
  };
}
