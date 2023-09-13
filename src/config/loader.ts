import process from 'process';
import fs from 'fs';
import path from 'path';
import { configSchema, ConfigSchema } from './schema';
import { ZodString, ZodBoolean, ZodNumber, ZodArray } from 'zod';
import { defaultConfig } from './defaults';
import { outputOption } from './formats';
import { normalizePath } from '../content/paths';

interface CliOptionsEntry {
	value: [string, number | boolean | string | string[]];
	error?: Error;
};

type IndexableObject = Record<string, any>;

const mergeConfigSources = (...args: IndexableObject[]) => {

	const merged: IndexableObject = {};

	const deepMerge = (target: IndexableObject, source: IndexableObject) => {

		for (let key in source) {

			const propIsAbsentOnTarget = !target[key];
			const propSourceIsArray = typeof source[key] === 'object' && Array.isArray(source[key]);
			const propIsPrimitive = ['string','number','boolean'].some(item => typeof source[key] === item);

			if (propIsAbsentOnTarget || propSourceIsArray || propIsPrimitive) {
				target[key] = source[key];
				continue;
			} else deepMerge(target[key], source[key]);
		}
	};

	for (let arg of args) {
		deepMerge(merged, arg);
	}

	return merged;
};

export const loadAppConfig = () => {

	const cliOptionArguments = process.argv.slice(2).filter(item => /^\-\-[\d\w\_\-]+(=[\d\w\_\-\,\.\*\\\/]+)?$/.test(item));
	const caselessOptionMap = Object.fromEntries(Object.keys(configSchema.shape).map(item => ([item.toLowerCase(), item]))) as Record<string, keyof ConfigSchema>;

	const cliOptionsEntries = cliOptionArguments.map(item => {

		const [arg_key, arg_value] = item.slice(2).split('=');
		const optionName = caselessOptionMap[arg_key.toLowerCase()];
		if (!optionName) return { error: new Error(`Argument was not recognized: ${arg_key} (${item})`) };

		const optionSchema = configSchema.shape[optionName as keyof typeof configSchema.shape];
		let optionValue: string | number | boolean | string[] = arg_value;

		if (optionSchema instanceof ZodBoolean) {

			optionValue = arg_value !== 'false';

		} else if (optionSchema instanceof ZodNumber) {

			let temp = parseInt(arg_value);
			if (!isNaN(temp)) optionValue = temp;

		} else if (optionSchema instanceof ZodString) {

			optionValue = arg_value;

		} else if (optionSchema instanceof ZodArray) {

			if (!(optionSchema.element instanceof ZodString))
				return new Error(`Cannot assign option: ${arg_key}: only string, number and string array type options can be set from CLI`);

			optionValue = arg_value.split(',');

		} else return { error: new Error(`Argument type could not be determined for: ${arg_key}`) };

		return { value: [optionName, optionValue] };

	}) as CliOptionsEntry[];

	const parsingErrors = cliOptionsEntries.filter(item => 'error' in item);
	if (parsingErrors.length)
		throw new Error(`CLI argument parsing failed:\n\t${parsingErrors.map(item => item!.error!.message).join('\n\t')}`);

	const configObjectCli: Partial<ConfigSchema> = Object.fromEntries(cliOptionsEntries.map(item => item.value));

	const configFilePath = configObjectCli?.configFile || defaultConfig.configFile;
	let configObjectFile: Partial<ConfigSchema> = {};

	if (fs.existsSync(configFilePath)) {

		try {
			const configFileContents = fs.readFileSync(configFilePath).toString();
			configObjectFile = JSON.parse(configFileContents) as Partial<ConfigSchema>;
		} catch (error) {
			throw new Error(`Could not parse config file contents: ${configFilePath}: file does not appear to be a valid JSON`);
		}

		const configFileSchemaValidation = configSchema.partial().safeParse(configObjectFile);
		if (configFileSchemaValidation.success === false) {
			const errorsList = configFileSchemaValidation.error.errors.map(item => `${item.message} on option(s): ${item.path.map(item => `"${item}"`).join(', ')}`);
			throw new Error(`Config file parsing errors:\n\t${errorsList.join('\n\t')}`);
		}

		const validatedEntries = Object.keys(configFileSchemaValidation.data);
		const allKeys = Object.keys(configObjectFile);

		if (allKeys.length !== validatedEntries.length) {
			const errorsList = allKeys.filter(key => !validatedEntries.some(validKey => key === validKey)).map(item => `Option "${item}" is not supported`);
			throw new Error(`Config file contains unsupported options:\n\t${errorsList.join('\n\t')}`)
		}

		//	make input/outpud paths relative to the config file
		const propsToRelative = ['inputDir', 'outputDir'] as (keyof ConfigSchema)[];
		const adaptedProps = propsToRelative.map(key => ([key, configObjectFile[key]])).filter(([_key, value]) => !!value).map(([key, value]) => ([key, path.join(path.dirname(configFilePath), value as string)]));
		Object.assign(configObjectFile, Object.fromEntries(adaptedProps));

	} else if (configObjectCli?.configFile)
		throw new Error(`Config file was not found at: "${configObjectCli.configFile}"`);

	const mergedConfig = mergeConfigSources(defaultConfig, configObjectFile, configObjectCli) as ConfigSchema;

	//	detect unknown formats
	const unknownFormas = mergedConfig.formats.filter(format => !outputOption.some(option => format === option));
	if (unknownFormas.length) {
		const errorsList = unknownFormas.map(item => `Unknown output format "${item}"`);
		throw new Error(`Unsupported output formats:\n\t${errorsList.join('\n\t')}`)
	}

	//	ensure that we don't write output to the source directory
	if (mergedConfig.inputDir.startsWith(mergedConfig.outputDir) || mergedConfig.outputDir.startsWith(mergedConfig.inputDir))
		throw new Error('Input and output directories must not contain each other');

	//	adjust cache dir path relative to input dir
	if (!(configObjectCli.cacheDir || configObjectFile.cacheDir))
		mergedConfig.cacheDir = path.join(mergedConfig.inputDir, './.cache');

	//	normalize paths
	const pathProps = ['inputDir', 'outputDir', 'cacheDir'] as (keyof ConfigSchema)[];
	const pathPropsNormalizedEntries = pathProps.map(item => {
		const pathProp = mergedConfig[item] as string;
		//	change "@/..." path to cwd-relative
		const resolvedPath = pathProp.replace(/^\@[\\\/]/, '');
		return [item, normalizePath(resolvedPath)];
	});
	Object.assign(mergedConfig, Object.fromEntries(pathPropsNormalizedEntries));

	return mergedConfig;
};
