#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';

import { getCachedAssets } from './content/cache';

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

	if (!config.noCache) console.log(chalk.bgGreen.black(' Updating cache... '), '\n');
	const cached = getCachedAssets(config.cacheDir);
	const unusedCache = cached.filter(item => !assets.some(item1 => item1.hash === item.hash));

	if (!config.noCache) unusedCache.forEach(item => {
		fs.statSync(item.file).isDirectory() ? fs.rmdirSync(item.file, { recursive: true }) : fs.rmSync(item.file);
	});

	await Promise.all(assets.map(async (asset) => {

		//	create dest dir
		const destDir = path.dirname(asset.dest);
		if (!fs.existsSync(destDir))
			fs.mkdirSync(destDir, { recursive: true });

		//	asset passtrough
		if (asset.action === 'copy') {
			fs.copyFileSync(asset.source, asset.dest);
			if (!config.silent) console.log(chalk.green('Copied:'), asset.dest);
			return;
		}

		//	sharp subroutine
		config.formats.forEach(async (format) => {

			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			
			//	copy if it's original
			if (format === 'original') {
				fs.copyFileSync(asset.source, asset.dest);
				if (!config.silent) console.log(chalk.green('Cloned original:'), asset.dest);
				return;
			}

			//	try getting from cache
			const cacheItem = asset.cache + `.${format}`;
			if (!config.noCache && fs.existsSync(cacheItem)) {
				fs.copyFileSync(cacheItem, dest);
				if (!config.silent) console.log(chalk.green('Cache hit:'), dest);
				return;
			}

			//	convert using sharp
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			if (!config.noCache) fs.copyFileSync(dest, cacheItem);
			if (!config.silent) console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		});
	}));

})();
