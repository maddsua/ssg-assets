import { importArguments } from './cli';
import { normalizePath, fix_relative_glob } from '../content/paths';

import { defaultConfig } from './defaults';
import { outputOption } from '../formats';

import chalk from 'chalk';

import { Config, ConfigSchema } from './schema';
import { loadConfigFile } from './file';

export const loadConfig = (): Required<Config> => {

	const mergedConfig = importArguments() as Record<string, any>;

	const projectOption = loadConfigFile(mergedConfig.config || 'ssgassets.config.json');

	if (projectOption) Object.entries(projectOption).forEach(([prop, value]) => {
		if (!ConfigSchema[prop]?.mutable_project) return;
		if (mergedConfig[prop]) return;
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

	mergedConfig.inputDir = normalizePath(mergedConfig.inputDir);
	mergedConfig.outputDir = normalizePath(mergedConfig.outputDir);

	//	ensure that we don't write output to the source directory
	if (mergedConfig.inputDir.startsWith(mergedConfig.outputDir) || mergedConfig.outputDir.startsWith(mergedConfig.inputDir))
		throw new Error('Input and output directories must not contain each other');

	const assetConfigFilePath = mergedConfig.inputDir + '/ssgassets.config.json';
	const assetsOption = loadConfigFile(assetConfigFilePath);
	if (assetsOption) {
		mergedConfig.assetConfig = assetConfigFilePath;
		Object.entries(assetsOption).forEach(([prop, value]) => {
			if (!ConfigSchema[prop]?.mutable_assets) return;
			if (!!mergedConfig[prop]) return;
			mergedConfig[prop] = value;
		});
	}

	const configEntries = Object.assign(defaultConfig, mergedConfig) as Required<Config>;

	configEntries.inputDir = normalizePath(configEntries.inputDir as string);
	configEntries.outputDir = normalizePath(configEntries.outputDir as string);

	configEntries.exclude = configEntries.exclude.map(item => normalizePath(item));
	configEntries.include = configEntries.include.map(item => normalizePath(item));

	//	fix glob patterns
	configEntries.exclude = configEntries.exclude.map(item => fix_relative_glob(item));
	configEntries.include = configEntries.include.map(item => fix_relative_glob(item));

	//	check for unknown output formats
	configEntries.formats.forEach(item => {
		if (!outputOption.some(item1 => item === item1)) {
			console.warn(chalk.yellow(`⚠  Unknown output format '${item}'`));
		}
	});

	configEntries.cacheDir = configEntries.inputDir + '/.cache';

	return configEntries as Required<Config>;
};

export default loadConfig;
