import process from 'process';
import fs from 'fs';
import path from 'path';

import esbuild from 'esbuild';

import { configSchema, type ConfigSchema, cliOptionsSchema, type CliOptionCtx } from './schema';
import { defaultConfig, configFileNames } from './defaults';
import { outputOption } from './formats';
import { normalizePath } from '../content/paths';

type CLIOptionEntry = [string, number | boolean | string | string[]];
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

const importConfigModule = async (moduleContentRaw: string) => {

	//	transform ts into plain js
	const moduleJsContent = await esbuild.transform(moduleContentRaw, {
		loader: 'ts',
		format: 'esm'
	});

	//	import dynamic module
	const moduleImportString = `data:text/javascript;base64,${btoa(moduleJsContent.code)}`;
	const moduleImported = await import(moduleImportString);
	const moduleExportStatements = ['default','config'];
	const moduleConfig = moduleExportStatements.map(item => moduleImported[item]).find(item => typeof item === 'object');
	if (!moduleConfig) throw new Error('Config module does not contain default export');

	return moduleConfig;
};

const parseCLIArguments = (args: string[]) => {

	const caselessOptionMap = Object.fromEntries(Object.keys(cliOptionsSchema).map(item => ([item.toLowerCase(), item]))) as Record<string, keyof CliOptionCtx>;
	const configSchemaKeys = Object.keys(configSchema.shape).map(item => item.toLowerCase());

	return args.map(argument => {

		const [arg_key, arg_value] = argument.slice(2).split('=');
		const optionName = caselessOptionMap[arg_key.toLowerCase()];
		if (!optionName) return new Error(configSchemaKeys.find(item => item === optionName) ? `Option ${optionName} cannot be set from CLI. Use config file instead` : `Argument was not recognized: ${arg_key} (${argument})`);
	
		const optionCtx = cliOptionsSchema[optionName as keyof typeof cliOptionsSchema] as CliOptionCtx;

		const parsePrimitive = (text: string, type: 'string' | 'number' | 'boolean') => {

			switch (type) {

				case 'number': {
					let temp = parseInt(arg_value);
					return isNaN(temp) ? new Error('Failed to parse number') : temp;
				}

				case 'boolean': {
					return text?.trim()?.toLowerCase() === 'true' || true;
				}

				default: return text;
			};
		};

		switch (optionCtx.type) {

			case 'primitive': {
				return [optionName, parsePrimitive(arg_value, optionCtx.dataType)];
			}

			case 'array': {
				let temp = arg_value.split(',');
				return [optionName, temp.map(item => parsePrimitive(item, optionCtx.dataType))];
			}

			default: return new Error('Unsupported CLI option type');
		};
	});
};

export const loadAppConfig = async () => {

	const cliOptionArguments = process.argv.slice(2).filter(item => /^\-\-[\d\w\_\-]+(=[\d\w\_\-\,\.\*\\\/]+)?$/.test(item));

	const cliOptionsEntries = parseCLIArguments(cliOptionArguments);

	const parsingErrors = cliOptionsEntries.filter(item => item instanceof Error);
	if (parsingErrors.length)
		throw new Error(`CLI argument parsing failed:\n\t${parsingErrors.map(item => (item as Error).message).join('\n\t')}`);

	const configObjectCli: Partial<ConfigSchema> = Object.fromEntries(cliOptionsEntries.map(item => item as CLIOptionEntry));

	const configFilePath = configObjectCli?.configFile || configFileNames.find(item => fs.existsSync(item)) || null;
	let configObjectFile: Partial<ConfigSchema> = {};

	if (configFilePath) {

		let configFileContents: string | null;

		try {
			configFileContents = fs.readFileSync(configFilePath).toString();
		} catch (_error) {
			throw new Error(`Could not read config file: "${configFilePath}"`);
		}

		if (path.extname(configFilePath) === '.json') {

			try {
				configObjectFile = JSON.parse(configFileContents) as Partial<ConfigSchema>;
			} catch (_error) {
				throw new Error(`Could not parse config file contents: ${configFilePath}: file does not appear to be a valid JSON`);
			}

		} else if (['.ts','.mts','.js','.mjs'].some(ext => path.extname(configFilePath) === ext)) {

			try {
				configObjectFile = await importConfigModule(configFileContents);
			} catch (error) {
				throw new Error(`Could not load config file module: ${configFilePath}:\n${error}`);
			}

		} else {
			throw new Error(`Unknown config file extension: ${configFilePath}`);
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

	} else if (configObjectCli?.configFile) {
		throw new Error(`Config file was not found at: "${configObjectCli.configFile}"`);
	}

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
	//	holy shit this is just hard to read
	const pathProps = ['inputDir', 'outputDir', 'cacheDir'] as (keyof ConfigSchema)[];
	Object.assign(mergedConfig, Object.fromEntries(pathProps.map(item => {
		const pathProp = mergedConfig[item] as string;
		//	change "@/..." path to cwd-relative
		const resolvedPath = pathProp.replace(/^\@[\\\/]/, '');
		return [item, normalizePath(resolvedPath)];
	})));

	return mergedConfig;
};
