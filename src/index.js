#! /usr/bin/env node
import { Command } from 'commander';
import { packageJSON } from './utils/packageJson.js';
import { query } from './query.js';

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description('Manage csvs databases.')
    .version(packageJSON.version, '-v, --version')
    .option('-i, --source-path <string>', 'Path to source')
    .option('-s, --source-type <string>', 'Type of source')
    // .option('--source-schema <string>', 'Path to source schema')
    .option('-t, --target-type <string>', 'Type of target')
    // .option('--target-schema <string>', 'Path to target schema')
    .option('-q, ---query <string>', 'Search string')
    .argument('[string]', 'Path to target')
    .action((options)=> {
      // if stdin
      // // if source type is biorg
      // // // parse biorg
      // // // stream entries -->
      // // if source type is json
      // // // parse json
      // // // stream entries -->
      // // if source type is csvs metadir stream
      // // // write metadir to temporary dir
      // // // query temporary dir
      // // // stream entries -->
      // if source path is directory
      // // if source type is not csvs
      // // // exception source type
      // // if source type is csvs
      // // // run -q or empty search query
      // // // if --gc optimize
      // // // stream entries -->
      // if source path is bi.org
      // // if source type is not biorg
      // // // exception source type
      // // if source type is biorg
      // // // parse biorg
      // // // stream entries -->
      // if source path is .json
      // // if source type is not json
      // // // exception source type
      // // if source type is json
      // // // parse json
      // // // stream entries -->
      //
      // if no target source
      // // if no target path
      // // // --> stream json -->
      // // if target path is directory
      // // // --> stream json
      // // if target path is file
      // // // --> stream biorg -->
      // if target source is biorg
      // // --> stream biorg -->
      // if target source is json
      // // --> stream json -->
      //
      // if no target path
      // // --> output to stdin
      // if target path is file
      // // --> append entries to file
      // if target path is directory
      // // if target directory is not metadir
      // // // exception not metadir
      // // --> write entries to metadir
    });

  program.parse();
})();
