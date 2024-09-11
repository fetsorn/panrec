#! /usr/bin/env node
import { Command } from "commander";
import stream from "stream";
import { pipeline } from "stream/promises";
import util from "util";
import { packageJSON } from "./utils/index.js";
import {
  importStream,
  passthroughStream,
  transformStream,
} from "./import/index.js";
import exportStream from "./export/index.js";

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description("Manage csvs databases.")
    .version(packageJSON.version, "-v, --version")
    .option("-i, --source-path <string>", "Path to source", process.cwd())
    .option("-o, --target-path <string>", "Path to target")
    .option("--hashsum", "Hashsum files during caching", false)
    .option("--yank", "Yank files to target database", false)
    // TODO if targetPath is specified, targetType defaults to "csvs"
    .option("-t, --target-type <string>", "Type of target", "json")
    .option("-q, --query <string>", "Search string", "?")
    .option("--stats", "Show database statistics", false)
    .action(async (options) => {
      const isStdin = process.stdin.isTTY === undefined;

      try {
        await pipeline([
          isStdin
            ? process.stdin
            : await importStream(
                options.sourcePath,
                options.query,
                options.hashsum,
                options.stats,
              ),
          await exportStream(
            options.targetPath,
            options.targetType,
            options.yank,
          ),
        ]);
      } catch (e) {
        console.error("pipeline error", e);
      }
    });

  program.parse();
})();
