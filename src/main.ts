#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';

import { getCachedAssets, CachedAsset } from './content/cache';

import fs from 'fs';

import sharp from 'sharp';
import chalk from 'chalk';
import path from 'path';

( async () => {

	console.log('\n');

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. The tool is extra talkative now.');
		console.log('Current config:', config, '\n');
	}

	console.log(chalk.bgGreen.black(' Hashing assets... '), '\n');

	const assets = await resolveAssets(config);
	let cached: CachedAsset[] | null = null;

	if (!config.noCache) {

		cached = getCachedAssets(config.cacheDir);

		const nukePath = (pathname: string) => fs.statSync(pathname).isDirectory() ? fs.rmdirSync(pathname, { recursive: true }) : fs.rmSync(pathname);

		if (!config.resetCache) {

			console.log(chalk.bgGreen.black(' Updating cache... '), '\n');

			const unusedCache = cached.filter(item => !assets.some(item1 => item1.hash === item.hash));
			unusedCache.forEach(item => nukePath(item.file));

		} else {

			console.log(chalk.bgGreen.black(' Resetting cache... '), '\n');

			cached.forEach(item => nukePath(item.file));
			cached = [];
		}

	} else {

		if (config.resetCache) console.warn(chalk.yellow('noCache and resetCache flags cannot be used at the same time. Just saying.', '\n'));
		console.log(chalk.bgWhite.black(' Cache disabled '), '\n');
	}

	const stats = {
		notChanged: 0,
		restoredFromCache: 0,
		passedThrough: 0,
		converted: 0
	};

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
			stats.passedThrough++;

			console.log(chalk.green('Cloned:'), asset.dest);
			return;
		}

		//	sharp subroutine
		config.formats.forEach(async (format) => {

			//	copy if it's original
			if (format === 'original') {
				if (await skipIfNotChanged(asset.source, asset.dest)) return;
				fs.copyFileSync(asset.source, asset.dest);
				console.log(chalk.green('Cloned original:'), asset.dest);
				return;
			}
			
			//	try getting from cache
			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			const cacheItem = asset.cache + `.${format}`;
			if (!config.noCache && fs.existsSync(cacheItem)) {

				if (await skipIfNotChanged(cacheItem, dest)) return;
				fs.copyFileSync(cacheItem, dest);
				stats.restoredFromCache++;
				
				console.log(chalk.green('Cache hit:'), dest);
				return;
			}

			//	convert using sharp
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			if (!config.noCache) fs.copyFileSync(dest, cacheItem);
			console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		});

		stats.converted++;

	}));

})();
