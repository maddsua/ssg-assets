#!/usr/bin/env node

import { version as appversion } from '../package.json';

import { parseArgs } from "./args";
import { loadConfig } from "./configLoader";
import { argv } from "process";
import os from 'os';

import chalk from 'chalk';
import { findAssets, getCachedAssets, indexAsset, isModified, type AssetEntry, type AssetFile } from './assets';
import { matchGlobOrRegexp } from './filters';
import { outputOptions, imageFormats } from './formats';
import { existsSync, rmSync } from 'fs';
import { splitChunks } from './utils';
import { copyStaticAssets, printStats, transformImageAssets, type InvocationStats } from './operations';

const main = async () => {

	console.log(chalk.bgWhite.black(` SSG Assets CLI v${appversion} `), '\n');

	const args = parseArgs(argv);
	const config = await loadConfig(args);

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

	console.log('Hashing assets...');
	const hashingStarted = new Date().getTime();

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

	console.log(chalk.green('Index ready in'), new Date().getTime() - hashingStarted, chalk.green('ms'));
	console.log('\r');

	if (assets.skipped.length && config.verbose) {

		for (const item of assets.skipped) {
			console.log(chalk.green(`>> Skipped`), item.slug);
		}
	}

	if (!config.preserveDist && existsSync(config.outputDir)) {
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

	const cacheIndex = getCachedAssets(config.cacheDir);

	if (assets.images.length) {
		console.log('\nTransforming images...\n');
		const batches = splitChunks(assets.images, os.cpus().length);
		await transformImageAssets(batches, invocStats, cacheIndex, config);
	}

	if (assets.static.length) {
		console.log('\nCopying static assets...\n');
		await copyStaticAssets(assets.static, invocStats, config);
	}

	const elapsed = new Date().getTime() - transformStarted;

	console.log('\n--------\n');
	printStats(invocStats);
	console.log('\r');
	console.log(chalk.green('✅ Completed in'), elapsed, chalk.green('ms'));
};

main().catch(error => {

	const errorMessage = error instanceof Error ? `-> ${error.message}` : `Unhandled exception: ${error}`;
	console.error(chalk.red(`❌ Asset processing terminated:\n`), errorMessage);

	process.exit(1);
});
