import { cliArguments } from './cli';

import { readFileSync } from 'fs';
import process from 'process';
import path from 'path';

import chalk from 'chalk';

import type { Config } from '../types';
import * as defaults from './defaults';

//	Default config
export const configEntries: Config = {
	config: 'ssgassets.config.json',
	hasLocalConfig: false,
	verbose: false,
	nocache: false,
	justCopy: false,
	formats: [...defaults.imageFormats],
	exclude: [],
	outputDir: '',
	inputDir: '',
	quality: Object.assign({}, defaults.imageQuality)
};

export const configEntriesMask = {
	cli: ['quality'],
	globalFile: ['config', 'foundLocalConfig'],
	localFile: ['config', 'foundLocalConfig', 'inputDir', 'outputDir']
};

export const loadConfig = () => {

	//	load options from cli argumets
	const optionsMap = Object.entries(cliArguments).map(item => item[1].argName.map(pfx => [pfx, item[0]])).flat();
	process.argv.slice(2).forEach(arg => {

		const argName = arg.split('=')[0];

		const optionId = optionsMap.find(item => item[0] === argName);
		if (!optionId) {
			console.log(chalk.yellow(`⚠  Unknown option '${argName}'`), '(cli)');
			return;
		}

		const configEntry = optionId[1];

		if (configEntriesMask.cli.find(item => item === configEntry)) return;

		const option = cliArguments[configEntry];
		if (!option) {
			console.log(chalk.yellow(`⚠  Unmatched option '${arg}'`), '(cli)');
			return;
		}

		let temp: any = undefined;
		for (let action of option.actions) {

			switch (action) {

				case 'impl_bool': {
					temp = true;
				} break;

				case 'get_value': {
					temp = arg.split('=')?.at(1);
					if (!temp) {
						console.log(chalk.yellow(`⚠  Empty option '${arg}'`));
						return;
					}
				} break;

				case 'to_string_array': {
					temp = temp.split(',');
				} break;
			
				default: break;
			}
		}

		configEntries[configEntry] = temp;
	});

	//	load project config file
	try {
		const configFileContents = readFileSync(path.join(process.cwd(), configEntries.config));
		const importedConfig = JSON.parse(configFileContents.toString());

		for (let key in importedConfig) {

			if (configEntriesMask.globalFile.some(item => item === key)) continue;

			if (!(key in configEntries)) {
				console.log(chalk.yellow(`⚠  Unknown key '${key}'`), `(${configEntries.config})`);
				continue;
			}

			if (typeof configEntries[key] !== typeof importedConfig[key]) {
				console.log(chalk.yellow(`⚠  Key '${key}' type invalid`), `(${configEntries.config})`);
				continue;
			}

			configEntries[key] = importedConfig[key];
		}

	} catch (_error) {
		//	oops, no global config file. ok, it's fine
	}

	//	set default paths if not provided
	if (!configEntries.inputDir.length) {
		configEntries.inputDir = 'assets';
		console.log(`Using default input directory: '${configEntries.inputDir}'`);
	}
	if (!configEntries.outputDir.length) {
		configEntries.outputDir = 'dist/assets';
		console.log(`Using default output directory: '${configEntries.outputDir}'`);
	}

	//	ensure that we don't write output to the source directory
	if (typeof configEntries.inputDir === 'string' && configEntries.inputDir === configEntries.outputDir) {
		console.log(chalk.red(`⚠  Input directory is the same as the output.`));
		process.exit(0);
	}
	
	//	load config from asset source directory
	try {
		const configFileContents = readFileSync(path.join(process.cwd(), path.join(configEntries.inputDir, 'ssgassets.config.json')));
		const importedConfig = JSON.parse(configFileContents.toString());
		configEntries.hasLocalConfig = true;

		for (let key in importedConfig) {

			if (configEntriesMask.localFile.some(item => item === key)) continue;

			if (!(key in configEntries)) {
				console.log(chalk.yellow(`⚠  Unknown key '${key}'`), `(${configEntries.config})`);
				continue;
			}

			if (typeof configEntries[key] !== typeof importedConfig[key]) {
				console.log(chalk.yellow(`⚠  Key '${key}' type invalid`), `(${configEntries.config})`);
				continue;
			}

			configEntries[key] = importedConfig[key];
		}

	} catch (error) {
		//	oops, no config file hire. ok, it's fine too
	}

	//console.log(configEntries);

	return configEntries;
};

export default loadConfig;