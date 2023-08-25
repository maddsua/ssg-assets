#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';

import { getCachedAssets, CachedAsset } from './content/cache';

import { Config } from './config/schema';

import fs from 'fs';

import sharp from 'sharp';
import chalk from 'chalk';
import path from 'path';

const printCliConfig = (config: Config) => {

	console.log('\r');
	console.log(chalk.bgWhite.black(' Current config: '));
	console.log('----');

	const configFilesList = [config.config && 'project', config.assetConfig && 'asset dir'];
	
	const temp = {
		'Config files': configFilesList.length ? configFilesList.join(', ') : 'none',
		'Cache': config.noCache ? 'disabled' : 'enabled',
		'Load from': `"${config.inputDir}"`,
		'Save to': `"${config.outputDir}"`,
		'Output formats': config.formats?.join(', ') || 'unset',
	};

	if (config.exclude.length) Object.assign(temp, {
		'Excluded': config.exclude.join(', ')
	});

	if (config.include.length) Object.assign(temp, {
		'Include filter': config.include.join(', ')
	});

	Object.entries(temp).forEach(item => console.log(item[0], ':', chalk.green(item[1])));
	console.log('----\n');
};

( async () => {

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. Tool is extra talkative now.');
		printCliConfig(config);
	}

	console.log('Hashing assets...');

	const assets = await resolveAssets(config);
	let cached: CachedAsset[] | null = null;

	if (!assets.length) throw new Error('No assets were located');
	if (config.verbose) console.log('Found', assets.length, 'asset sources\n');

	if (!config.noCache) {

		cached = getCachedAssets(config.cacheDir);

		const nukePath = (pathname: string) => fs.statSync(pathname).isDirectory() ? fs.rmdirSync(pathname, { recursive: true }) : fs.rmSync(pathname);

		if (!config.resetCache) {

			console.log('Updating cache...');

			const unusedCache = cached.filter(item => !assets.some(item1 => item1.hash === item.hash));
			unusedCache.forEach(item => nukePath(item.file));

		} else {

			console.log('Resetting cache...');

			cached.forEach(item => nukePath(item.file));
			cached = [];
		}

	} else {

		if (config.resetCache) console.warn(chalk.yellow('noCache and resetCache flags cannot be used at the same time. Just saying.', '\n'));
		console.log(chalk.bgWhite.black(' Cache disabled '), '\n');
	}

	const stats = {
		notChanged: 0,
		cacheHits: 0,
		copied: 0,
		sharpConverted: 0
	};

	console.log('\r');

	await Promise.all(assets.map(async (asset) => {

		//	skip assets with no assigned action
		if (!asset.action) return;

		const skipIfNotChanged = (sourcePath: string, destpath: string) => new Promise<boolean>(resolve => (async () => {

			//	not checking if file exist, it will just fail and return false
			const destModified = fs.statSync(destpath).mtimeMs;
			const sourceModified = fs.statSync(sourcePath).mtimeMs;

			if (destModified !== sourceModified) {
				resolve(false);
				return;
			}

			if (config.verbose) console.log(chalk.green('Not changed:'), destpath);
			stats.notChanged++;

			resolve(true);

		})().catch((_error) => resolve(false)));

		//	create dest dir
		const destDir = path.dirname(asset.dest);
		if (!fs.existsSync(destDir))
			fs.mkdirSync(destDir, { recursive: true });

		//	asset passtrough
		if (asset.action === 'copy') {

			if (await skipIfNotChanged(asset.source, asset.dest)) return;
			fs.copyFileSync(asset.source, asset.dest);
			stats.copied++;

			console.log(chalk.green('Copied:'), asset.dest);
			return;
		}

		//	sharp subroutine
		await Promise.all(config.formats.map(async (format) => {

			//	copy if it's original
			if (format === 'original') {
				if (await skipIfNotChanged(asset.source, asset.dest)) return;
				fs.copyFileSync(asset.source, asset.dest);
				stats.copied++;
				console.log(chalk.green('Copied original:'), asset.dest);
				return;
			}

			//	skip conversion for the same format as the source, if we already copied original
			if (asset.source.endsWith(format) && config.formats.some(format => format === 'original')) {
				return;
			}

			//	try getting from cache
			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			const cacheItem = asset.cache + `.${format}`;
			if (!config.noCache && fs.existsSync(cacheItem)) {

				if (await skipIfNotChanged(cacheItem, dest)) return;
				fs.copyFileSync(cacheItem, dest);
				stats.cacheHits++;
				
				console.log(chalk.green('Cache hit:'), dest);
				return;
			}

			//	convert using sharp
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			if (!config.noCache) fs.copyFileSync(dest, cacheItem);
			stats.sharpConverted++;
			console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		}));

	}));

	if (Object.values(stats).some(item => item > 0)) {
		console.log('\r');
		if (stats.sharpConverted) console.log('Converted:', stats.sharpConverted, 'images');
		if (stats.cacheHits) console.log('Cache hits:', stats.cacheHits);
		if (stats.copied) console.log('Copied:', stats.copied, 'assets');
		if (stats.notChanged) console.log('Verified:', stats.notChanged, 'assets');
	}

	console.log(chalk.bgGreen.black('\n Processing done. \n'));

})().catch((error: Error | any) => {
	if (error instanceof Error) console.error(chalk.red(`❌ Asset processing terminated:\n-> ${error.message}`))
		else console.error(chalk.red(`❌  Asset processing terminated:\nUnhandled exception:`), error);
	process.exit(1);
});
