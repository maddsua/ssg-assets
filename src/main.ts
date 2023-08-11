#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';

import { getCachedAssets, CachedAsset } from './content/cache';

import fs from 'fs';

import sharp from 'sharp';
import chalk from 'chalk';
import path from 'path';

( async () => {

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. Tool is extra talkative now.');
		console.log('Current config:', config, '\n');
	}

	console.log('Hashing assets...');

	const assets = await resolveAssets(config);
	let cached: CachedAsset[] | null = null;

	if (!assets.length) {
		console.error(chalk.red(`⚠  No assets were located`));
		process.exit(1);
	}

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
		converted: 0
	};

	console.log(chalk.bgWhite.black('\n Converting... \n'));

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
		config.formats.forEach(async (format) => {

			//	copy if it's original
			if (format === 'original') {
				if (await skipIfNotChanged(asset.source, asset.dest)) return;
				fs.copyFileSync(asset.source, asset.dest);
				stats.copied++;
				console.log(chalk.green('Copied original:'), asset.dest);
				return;
			}
			
			//	try getting from cache
			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			const cacheItem = asset.cache + `.${format}`;
			if (!config.noCache && fs.existsSync(cacheItem)) {

				if (await skipIfNotChanged(cacheItem, dest)) return;
				fs.copyFileSync(cacheItem, dest);
				stats.cacheHits++;
				
				if (config.verbose) console.log(chalk.green('Cache hit:'), dest);
				return;
			}

			//	convert using sharp
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			if (!config.noCache) fs.copyFileSync(dest, cacheItem);
			stats.converted++;
			console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		});
	}));

	console.log(chalk.bgGreen.black('\n Processing done. \n'));

	if (config.verbose) {
		console.log('Results:');
		console.table({
			'Total inputs': {
				'Assets': assets.length
			},
			'Converted': {
				'Assets': stats.converted
			},
			'Not changed': {
				'Assets': stats.notChanged
			},
			'Cache hits': {
				'Assets': stats.cacheHits
			},
			'Copied files': {
				'Assets': stats.copied
			}
		});
	}

})();
