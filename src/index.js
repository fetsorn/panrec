#! /usr/bin/env node
import { Command } from 'commander';
import { packageJSON } from './utils/packageJson.js';
import { readStream, passthroughStream, transformStream } from './parse/index.js';
import { writeStream } from './build/index.js';
import stream from 'stream';
import util from 'util';
const pipeline = util.promisify(stream.pipeline);

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description('Manage csvs databases.')
    .version(packageJSON.version, '-v, --version')
    .option('-i, --source-path <string>', 'Path to source', process.cwd())
    .option('-o, --target-path <string>', 'Path to target')
    .option('--hashsum', 'Hashsum files during caching', false)
    // TODO if targetPath is specified, targetType defaults to "csvs"
    .option('-t, --target-type <string>', 'Type of target', 'json')
    .option('-q, --query <string>', 'Search string', '?')
    .action(async (options) => {
      const isStdin = process.stdin.isTTY === undefined

      try {
        await pipeline(
          isStdin
            ? process.stdin
            : await readStream(options.sourcePath, options.query, options.hashsum),
          isStdin
            ? await transformStream(options.sourcePath, options.query, options.hashsum)
            : passthroughStream(),
          writeStream(options.targetPath, options.targetType)
        )
      } catch(e) {
        console.log("pipeline", e)
      }
    });

  program.parse();
})();
