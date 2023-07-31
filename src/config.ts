import { readFileSync } from 'fs';
import { cwd } from 'process';
import path from 'path';

import chalk from 'chalk';

import type { ImageFormats, Config } from './types';

const supportedImageFormats: ImageFormats[] = [ 'original', 'webp', 'avif' ];

const globalConfigFile = 'ssgassets.config.json';

const configEntries: Config = {
	verbose: false,
	nocache: false,
	justCopy: false,
	formats: supportedImageFormats,
	exclude: []
};

export const loadConfig = () => {

	//	load project global config
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

		console.log(importedConfig);
	} catch (_error) {
		//	oops, no global config file. ok, it's fine
	}


	console.log(configEntries);


	return configEntries;
};

loadConfig();

export default loadConfig;
