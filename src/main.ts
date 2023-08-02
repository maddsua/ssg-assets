#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';

import { getCachedAssets } from './content/cache';

import fs from 'fs';

import sharp from 'sharp';
import chalk from 'chalk';
import path from 'path';


( async () => {

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. The tool is extra talkative now.');
		console.log('Current config:', config);
	}

	console.log(chalk.bgGreen.black(' Hashing assets... '));

	const assets = await resolveAssets(config);

	//console.log(assets);

	const cached = getCachedAssets(config.cacheDir);

	const unusedCache = cached.filter(item => !assets.some(item1 => item1.hash === item.hash));

	//console.log('unused:', unusedCache);

	unusedCache.forEach(item => {
		fs.statSync(item.file).isDirectory() ? fs.rmdirSync(item.file, { recursive: true }) : fs.rmSync(item.file);
		//console.log(chalk.yellow('Removed from cache original:'), item.file);
	});


	await Promise.all(assets.map(async (asset) => {

		//	sharp subroutine
		config.formats.forEach(async (format) => {

			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			const destDir = path.dirname(asset.dest);
			if (!fs.existsSync(destDir))
				fs.mkdirSync(destDir, { recursive: true });
			
			//	copy if it's original
			if (format === 'original') {
				fs.copyFileSync(asset.source, asset.dest);
				if (!config.silent) console.log(chalk.green('Cloned original:'), asset.dest);
				return;
			}
			
			//	try getting from cache
			const cacheItem = asset.cache + `.${format}`;
			if (fs.existsSync(cacheItem)) {
				fs.copyFileSync(cacheItem, dest);
				if (!config.silent) console.log(chalk.green('Cache hit:'), asset.dest);
				return;
			}

			//	convert using sharp
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			fs.copyFileSync(dest, cacheItem);
			if (!config.silent) console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		});
	}));

})();
