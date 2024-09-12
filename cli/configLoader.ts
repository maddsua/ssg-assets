import { cwd } from "process";
import { join, dirname } from "path";
import { existsSync, readFileSync } from 'fs';
import { transform } from 'esbuild';

import type { CliArgs } from "./args";
import type { RuntimeConfig, Config, OutputOptionsConfig } from "./config";
import { defaultConfig, defaultConfigFiles, defaultQuality } from "./configDefaults";

const esModuleConfigExports = [
	'default',
	'config',
];

export const loadConfig = async (args: CliArgs): Promise<RuntimeConfig> => {

	const configLocation = args.config || findDefaultConfig();
	const userConfig = await loadConfigFile(configLocation);

	const inputDir = resolveRelativePaths(userConfig.inputDir || defaultConfig.inputDir, args.config);
	const outputFormats = userConfig.outputFormats || defaultConfig.outputFormats;

	return {
		verbose: userConfig.verbose ?? args.verbose ?? false,
		noCache: !!userConfig.noCache,
		outputFormats: Array.isArray(outputFormats) ? mapImageFormats(outputFormats) : outputFormats,
		inputDir,
		outputDir: resolveRelativePaths(userConfig.outputDir || defaultConfig.outputDir, args.config),
		cacheDir: userConfig.cacheDir || join(inputDir, './.cache'),
		skip: userConfig.skip || null,
		filter: userConfig.filter || null,
		clearDist: userConfig.clearDist ?? false,

		configFile: configLocation,
	};
};

const findDefaultConfig = (): string | null => {

	for (const item of defaultConfigFiles) {

		const tryPath = item.startsWith('/') ? item : join(cwd(), item);

		if (existsSync(tryPath)) {
			return tryPath;
		}
	}

	return null;
};

const loadConfigFile = async (configFilePath: string | null): Promise<Config> => {

	if (!configFilePath) {
		return {};
	}

	if (!existsSync(configFilePath)) {
		throw new Error(`Config file path does not exist: ${configFilePath}`);
	}

	try {

		if (configFilePath.endsWith('.json')) {
			return parseJsonConfig(readConfig(configFilePath));
		}
	
		if (['.ts','.mts','.js','.mjs'].some(item => configFilePath.endsWith(item))) {
			return await parseEsConfig(readConfig(configFilePath));
		}
		
	} catch (error) {
		
		const errorText = error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : `${error}`);

		throw new Error(`Failed to load config at "${configFilePath}": ${errorText}`);
	}

	throw new Error(`Unsupported config file format: ${configFilePath}`);
};

const readConfig = (configFilePath: string) => {
	try {
		return readFileSync(configFilePath).toString('utf-8');
	} catch (error) {
		throw new Error(`Unable to read file`);
	}
};

const parseJsonConfig = (content: string): Config => {
	try {
		return JSON.parse(content);
	} catch (error) {
		throw new Error(`Unable to parse JSON`);
	}
};

const importEsConfigModule = async (content: string): Promise<Record<string, any>> => {

	//	transform ts into plain js
	const configModule = await transform(content, {
		loader: 'ts',
		format: 'esm'
	});

	//	import dynamic module
	return await import(`data:text/javascript;base64,${btoa(configModule.code)}`);
};

const parseEsConfig = async (content: string): Promise<Config> => {

	const configModule = await importEsConfigModule(content);

	for (const exportedKey of esModuleConfigExports) {

		const exportedProp = configModule[exportedKey];

		if (typeof exportedProp === 'object') {
			return exportedProp;
		}
	}

	throw new Error('Config module does not contain default export');
};

const mapImageFormats = (entries: string[]): OutputOptionsConfig => {

	const result: OutputOptionsConfig = {};

	for (const item of entries) {

		const quality = defaultQuality[item as keyof typeof defaultQuality] || 90;
		result[item as keyof OutputOptionsConfig] = { quality };
	}

	return result;
};

const resolveRelativePaths = (filePath: string, configPath: string | null): string => {

	if (!configPath) {
		return filePath;
	}

	if (filePath.startsWith('@/')) {
		return join('./', filePath.slice(2));
	}

	return join(dirname(configPath), filePath);
};
