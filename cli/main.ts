#!/usr/bin/env node

import { argv } from "process";

import chalk from 'chalk';

import { version as appversion } from '../package.json';

import { parseArgs, type CliArgs } from "./args";
import { loadConfig } from "./configLoader";

import { findAssets, getCachedAssets, indexAsset, type AssetEntry, type AssetFile } from './assets';
import { matchGlobOrRegexp } from './filters';
import { outputOptions, imageFormats } from './formats';
import { existsSync, rmSync } from 'fs';
import { clearUnusedCache, copyStaticAssets, transformImageAssets, type InvocationStats, type ProgressMetrics } from './operations';
import type { RuntimeConfig } from "./config";
import { formatTime, normalizePath } from "./utils";

const main = async () => {

	console.log(chalk.bgWhite.black(` SSG Assets CLI v${appversion} `), '\n');

	const args = parseArgs(argv);
	const config = await loadConfig(args);

	if (config.verbose) {
		console.log('Verbose mode enabled. Tool is extra talkative now.');
		printCliConfig(config, args);
	}

	//	detect unknown formats in config
	const unknownFormas = Object.keys(config.outputFormats)
		.filter(format => !outputOptions.has(format));

	if (unknownFormas.length) {
		const errorsList = unknownFormas.map(item => `Unknown output format "${item}"`);
		throw new Error(`Unsupported output formats:\n\t${errorsList.join('\n\t')}`)
	}

	//	ensure that we don't write output to the source directory
	if (config.inputDir.startsWith(config.outputDir) || config.outputDir.startsWith(config.inputDir)) {
		throw new Error('Input and output directories must not contain each other');
	}

	//	clear cache directory if requested
	if (args.clearCache && existsSync(config.cacheDir)) {
		rmSync(config.cacheDir, { recursive: true });
	}

	console.log('Indexing assets...');

	const indexingStarted = new Date().getTime();
	const allAssetFiles = await findAssets(config.inputDir, config.cacheDir);

	if (!allAssetFiles.length) {
		throw new Error('No assets were located');
	} else if (config.verbose) {
		console.log('Found', allAssetFiles.length, 'assets');
	}

	const assets = {
		skipped: [] as AssetFile[],
		static: [] as AssetFile[],
		images: [] as AssetEntry[],
	};

	for (const item of allAssetFiles) {

		if (config.skip?.length) {
			if (config.skip.some(pattern =>matchGlobOrRegexp(pattern, item.slug))) {
				assets.skipped.push(item);
				continue;
			}
		}

		if (typeof config.filter === 'function') {
			if (config.filter(item.slug)) {
				assets.skipped.push(item);
				continue;
			}
		}

		if (imageFormats.has(item.ext)) {
			assets.images.push(await indexAsset(item));
			continue;
		}

		assets.static.push(item);
	}

	console.log(chalk.green('Index ready in'), new Date().getTime() - indexingStarted, chalk.green('ms'));
	console.log('\r');

	if (assets.skipped.length && config.verbose) {

		for (const item of assets.skipped) {
			console.log(chalk.green(`>> Skipped`), item.slug);
		}
	}

	if (config.clearDist && existsSync(config.outputDir)) {
		rmSync(config.outputDir, { recursive: true });
	}

	const transformStarted = new Date().getTime();

	const invocStats: InvocationStats = {
		notModified: 0,
		cacheHit: 0,
		copied: 0,
		transformed: 0,
		skipped: assets.skipped.length,
	};

	const progress: ProgressMetrics = {
		current: 0,
		total: (assets.images.length * Object.keys(config.outputFormats).length) + assets.static.length,
	};

	const cacheIndex = getCachedAssets(config.cacheDir);

	await transformImageAssets(assets.images, invocStats, progress, cacheIndex, config);
	await copyStaticAssets(assets.static, invocStats, progress, config);
	await clearUnusedCache(cacheIndex, config);

	const elapsed = formatTime(new Date().getTime() - transformStarted);

	console.log('\n', chalk.green('✅ Completed in'), elapsed.value, chalk.green(elapsed.suffix), '\n');

	for (const key in invocStats) {

		const value = invocStats[key as keyof InvocationStats];
		if (!value) {
			continue;
		}
		
		const printer = statsPrinter[key as keyof InvocationStats];
		if (!printer) {
			throw new Error(`Stats printer error: key not found: "${key}"`);
		}

		printer(value);
	}

};

main().catch(error => {

	const errorMessage = error instanceof Error ? `-> ${error.message}` : `Unhandled exception: ${error}`;
	console.error(chalk.red(`❌ Operation canceled:\n`), errorMessage);

	process.exit(1);
});

const statsPrinter: Record<keyof InvocationStats, (val: number) => void> = {
	transformed: val => console.log('Transformed:', val, 'images'),
	cacheHit: val => console.log('Cache hits:', val),
	copied: val => console.log('Copied:', val, 'assets'),
	notModified: val => console.log('Verified:', val, 'assets'),
	skipped: val => console.log('Skipped:', val, 'assets'),
};

const printCliConfig = (config: RuntimeConfig, args: CliArgs) => {

	console.log('\r');
	console.log(chalk.bgWhite.black(' Current config: '));
	console.log('----');
	
	const entries: [string, string][] = [
		['Cache', args.clearCache ? 'clear' : config.noCache ? 'disabled' : 'enabled'],
		['Load from', `"${normalizePath(config.inputDir)}"`],
		['Save to', `"${normalizePath(config.outputDir)}"`],
		['Output formats', Object.keys(config.outputFormats).join(',')],
		['Concurrency', `${config.concurrency}`],
	];

	if (config.skip?.length) {
		entries.push(['Skip patterns', config.skip.join(', ')]);
	}

	for (const [key, value] of entries) {
		console.log(key, ':', chalk.green(value));
	}

	console.log('----\n');
};
