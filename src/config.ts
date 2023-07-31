import { readFileSync } from 'fs';
import { cwd, argv } from 'process';
import path from 'path';

import chalk from 'chalk';

import type { ImageFormats, GlobalConfig } from './types';

const supportedImageFormats: ImageFormats[] = [ 'original', 'webp', 'avif' ];

const globalConfigFile = 'ssgassets.config.json';

const configEntries: GlobalConfig = {
	verbose: false,
	nocache: false,
	justCopy: false,
	formats: supportedImageFormats,
	exclude: []
};

interface Argument {
	pfx: string[];
	actions: Array< 'get_value' | 'impl_bool' | 'to_string_array' >;
}

const cliArguments: Record<string, Argument> = {
	config: {
		pfx: ['--config'],
		actions: ['get_value']
	},
	verbose: {
		pfx: ['--verbose'],
		actions: ['impl_bool']
	},
	nocache: {
		pfx: ['--nocache'],
		actions: ['impl_bool']
	},
	justCopy: {
		pfx: ['--copy'],
		actions: ['impl_bool']
	},
	formats: {
		pfx: ['--formats'],
		actions: ['get_value', 'to_string_array']
	},
	exclude: {
		pfx: ['--exclude'],
		actions: ['get_value', 'to_string_array']
	},
	inputDir: {
		pfx: ['--input'],
		actions: ['get_value']
	},
	outputDir: {
		pfx: ['--output'],
		actions: ['get_value']
	},

};

export const loadConfig = () => {

	//	load options from cli argumets
	const optionsMap = Object.entries(cliArguments).map(item => item[1].pfx.map(pfx => [pfx, item[0]])).flat();
	process.argv.slice(2).forEach(arg => {

		const optionId = optionsMap.find(item => arg.startsWith(item[0]));
		if (!optionId) {
			console.log(chalk.yellow(`⚠  Unknown option '${arg}'`));
			return;
		}

		const configEntry = optionId[1];

		const option = cliArguments[configEntry];
		if (!option) {
			console.log(chalk.yellow(`⚠  Unmatched option '${arg}'`));
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
			
				default:
					break;
			}
		}

		configEntries[configEntry] = temp;
	});

	//	load project config file
	try {
		const configFileContents = readFileSync(path.join(cwd(), globalConfigFile));
		const importedConfig = JSON.parse(configFileContents.toString());

		for (let key in importedConfig) {

			if (!(key in configEntries)) {
				console.log(chalk.yellow(`⚠  Key '${key}' is not supported`), `(${globalConfigFile})`);
				continue;
			}

			if (typeof configEntries[key] !== typeof importedConfig[key]) {
				console.log(chalk.yellow(`⚠  Key '${key}' type invalid`), `(${globalConfigFile})`);
				continue;
			}

			configEntries[key] = importedConfig[key];
		}

	} catch (_error) {
		//	oops, no global config file. ok, it's fine
	}
	

	console.log(configEntries);


	return configEntries;
};

loadConfig();

export default loadConfig;
