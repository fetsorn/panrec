#! /usr/bin/env node
import { Command } from "commander";
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
    .description("Manage csvs databases and other datasets.")
    .version(packageJSON.version, "-v, --version")
    .option("-i, --source-path <string>", "Path to source", process.cwd())
    .option("-o, --target-path <string>", "Path to target")
    .option("--hashsum", "Hashsum files during caching", false)
    .option("--yank", "Yank files to target database", false)
    .option("--insert", "Append tablets instead of updating", false)
    .option("--delete", "Delete from tablets instead of updating", false)
    .option("--create", "Create output", false)
    .option("-l, --light", "Only search for matching base keys", false)
    // TODO if targetPath is specified, targetType defaults to "csvs"
    .option("-t, --target-type <string>", "Type of target", "json")
    .option("-q, --query <string>", "Search string", "?")
    .option("--stats", "Show database statistics", false)
    .action(async (options) => {
      // Actually the most common Node CLI pattern is: default to file mode, require an explicit - or --stdin flag for stdin. That way scripts and
      //pipes work predictably. The current logic is backwards — it assumes stdin unless proven otherwise.
      const isStdin = process.argv.includes("-");

      const input = isStdin
        ? ReadableStream.from(process.stdin)
        : await importStream(
            options.sourcePath,
            options.query,
            options.hashsum,
            options.stats,
            options.light,
          );

      const through = isStdin
        ? await transformStream(
            options.sourcePath,
            options.query,
            options.hashsum,
            options.stats,
          )
        : passthroughStream();

      const output = await exportStream(
        options.targetPath,
        options.targetType,
        options.yank,
        options.insert,
      );

      await input.pipeThrough(through).pipeTo(output);
    });

  program.parse();
})();
