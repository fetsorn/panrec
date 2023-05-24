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
      // // if stdin and source path
      // // // exception stdin source path
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
      // TODO: if no stdin and no source path
      // // // TODO: if source type is fs
      // // // read path from .git
      // // // // exception no file path in .git
      // // // list file paths as stream -->
      // // // --> stream stat of files -->
      // // // --> stream entries -->
      // // // if source type is csvs
      // // // list file paths as stream -->
      // // // --> stream stat of files -->
      // // // --> stream entries -->
      // // // if source type is biorg
      // // // // exception no biorg input
      // // // if source type is json
      // // // // exception no json input
      // TODO: if source path is directory
      // // if source type is not csvs or fs
      // // // exception source type
      // // if source type is csvs
      // // // run -q or empty search query
      // // // if --gc optimize
      // // // stream entries -->
      // // TODO: if source type is fs
      // // // list file paths as stream -->
      // // // --> stream stat of files -->
      // // // --> stream entries -->
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
      // // TODO: map source and target schemas
      // // transform
      //
      // if no target type
      // // if no target path
      // // // --> stream json -->
      // // if target path is directory
      // // // --> stream json
      // // if target path is file
      // // // --> stream biorg -->
      // if target type is biorg
      // // --> stream biorg -->
      // if target type is json
      // // --> stream json -->
      // TODO: if target type is csvs
      // // --> stream json -->
      //
      // if no target path
      // // --> output to stdin
      // if target path is file
      // // --> append entries to file
      // TODO: if target path is directory
      // // if target directory is not metadir
      // // // exception not metadir
      // // if target directory is metadir
      // // TODO: --> write entries to metadir
      // // // if source path is csvs
      // // // // copy binary blobs from source asset endpoint to target
    });

  program.parse();
})();
