#! /usr/bin/env node
import { Command } from 'commander';
import { packageJSON } from './utils/packageJson.js';
import { query } from './query.js';

(async () => {
  const program = new Command();

  program
    .name(packageJSON.name)
    .description('Tell the story of your own data.')
    .version(packageJSON.version);

  program.command('query')
    .description('query items from csvs database')
    .argument('<string>', 'URL query')
    .action(query);

  program.parse();
})();
