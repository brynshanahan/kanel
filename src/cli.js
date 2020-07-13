import path from 'path';
import chalk from 'chalk';
// @ts-ignore
import optionator from 'optionator';
import processDatabase from './processDatabase';
import { logger } from './logger';
// @ts-ignore
const { version } = require('../package.json');

async function main() {
  const o = optionator({
    prepend: 'Usage: kanel [options]',
    append: `Version ${version}`,
    options: [
      {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'displays help',
      },
      {
        option: 'version',
        alias: 'v',
        type: 'Boolean',
        description: 'displays version',
      },
      {
        option: 'config',
        alias: 'c',
        type: 'path::String',
        description:
          'Use this configuration, overriding .schemalintrc.* config options if present',
      },
    ],
  });

  let options;

  try {
    options = o.parseArgv(process.argv);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }

  if (options.help) {
    console.log(o.generateHelp());
    process.exit(0);
  }

  if (options.version) {
    console.log(version);
    process.exit(0);
  }

  const configFile = path.join(process.cwd(), options.config || '.kanelrc.js');
  const config = require(configFile);

  if (config.logLevel !== undefined) {
    logger({ level: config.logLevel });
  }

  logger.log(chalk.greenBright('Kanel'));
  logger.quiet`${chalk.greenBright('Kanel')}: Creating psql types`;

  try {
    const exitCode = await processDatabase(config);
    process.exit(exitCode);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

main();
