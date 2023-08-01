import { importArguments } from './cli';
import { normalizePath, fix_relative_glob } from '../paths';

import { defaultConfig, outputFormats } from './defaults';

import { readFileSync } from 'fs';
import process from 'process';
import path from 'path';

import chalk from 'chalk';

import { Config, ConfigSchema } from '../types';
import { loadConfigFile } from './file';


export const mergedConfigMask = {
	globalFile: ['projectConfig', 'assetDirConfig'],
	localFile: ['projectConfig', 'assetDirConfig', 'inputDir', 'outputDir']
};

export const loadConfig = () => {

	const mergedConfig = importArguments() as Partial<Config>;

	const projectOption = loadConfigFile(mergedConfig.config || 'ssgassets.config.json');

	Object.entries(projectOption).forEach(([prop, value]) => {
		if (!ConfigSchema[prop]?.mutable_project) return;
		if (!!mergedConfig[prop]) return;
		mergedConfig[prop] = value;
	});

	if (!mergedConfig.inputDir) {
		mergedConfig.inputDir = 'assets';
		console.warn(`Using default input directory: '${mergedConfig.inputDir}'`);
	}
	if (!mergedConfig.outputDir) {
		mergedConfig.outputDir = 'dist/assets';
		console.log(`Using default output directory: '${mergedConfig.outputDir}'`);
	}

	//	ensure that we don't write output to the source directory
	if (mergedConfig.inputDir.startsWith(mergedConfig.outputDir) || mergedConfig.outputDir.startsWith(mergedConfig.inputDir)) {
		console.error(chalk.red(`⚠  Input and output paths must be separate directories.`));
		process.exit(0);
	}

	mergedConfig.inputDir = normalizePath(mergedConfig.inputDir);
	mergedConfig.outputDir = normalizePath(mergedConfig.outputDir);

	const assetsOption = loadConfigFile(mergedConfig.inputDir + '/ssgassets.config.json');

	Object.entries(assetsOption).forEach(([prop, value]) => {
		if (!ConfigSchema[prop]?.mutable_assets) return;
		if (!!mergedConfig[prop]) return;
		mergedConfig[prop] = value;
	});

	const configEntries = Object.assign(defaultConfig, mergedConfig);

	configEntries.exclude = configEntries.exclude.map(item => normalizePath(item));
	configEntries.include = configEntries.include.map(item => normalizePath(item));

	//	fix  glob patterns
	configEntries.exclude = configEntries.exclude.map(item => fix_relative_glob(item));
	configEntries.include = configEntries.include.map(item => fix_relative_glob(item));

	//	double-check flags
	if (configEntries.silent && configEntries.verbose) {
		configEntries.verbose = false;
		console.warn(chalk.yellow(`⚠  Both 'silent' and 'verbose' flags are specified, 'verbose' will be suppressed.`));
	}

	//	check for unknown output formats
	configEntries.formats.forEach(item => {
		if (!outputFormats.some(item1 => item === item1)) {
			console.warn(chalk.yellow(`⚠  Unknown output format '${item}'`));
		}
	});

	return configEntries;
};

export default loadConfig;
