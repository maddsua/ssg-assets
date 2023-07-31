#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

import { AssetsListItem } from './types';

import sharp from 'sharp';
import chalk from 'chalk';

import { loadConfig } from './config/loader';
import { resolveAssets } from './content/loader';
import { AssetsCacheIndex } from './content/cache';

( async () => {

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. The tool is extra talkative now.');
		console.log('Current config:', config);
	}
	
	console.log('\n', chalk.bgGreen.black(' Hashing assets... '));

	const assets = resolveAssets(config);

	const assetsMap = new Map<string, AssetsListItem>(assets.map(item => [item.slugHash, item]));
	const cacheIndex = new AssetsCacheIndex(config.inputDir, config.verbose);
	const cacheDiff = await cacheIndex.diff(assets);
	
	//	convert changed assets
	const convertAsset = async (asset: AssetsListItem, format: keyof sharp.FormatEnum) => {
		const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
		await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
		fs.copyFileSync(dest, asset.cache + `.${format}`);
	}
	
	const converJob = [cacheDiff.added, cacheDiff.changed].flat();

	await Promise.all(converJob.map( async (item) => {

		const asset = assetsMap.get(item);
		const destdir = path.dirname(asset.dest);

		if (!fs.existsSync(destdir))
			fs.mkdirSync(destdir, { recursive: true });

		if (asset.action === 'copy') {

			fs.copyFileSync(asset.source, asset.dest);
			if (!config.silent) console.log(chalk.green(`Cloned origin: `), asset.source);

		} else if (asset.action === 'convert') {

			await Promise.all(config.formats.map(async (format) => {

				if (format === 'original') {
					fs.copyFileSync(asset.source, asset.dest);
				} else {
					await convertAsset(asset, format);
				}

			}));

			if (!config.silent) console.log(chalk.green(`Converted and cached: `), asset.source);
		}
	}));

	//	copy cache-hit files
	cacheDiff.hit.forEach(item => {

		const asset = assetsMap.get(item);
		const destdir = path.dirname(asset.dest);

		if (!fs.existsSync(destdir))
			fs.mkdirSync(destdir, { recursive: true });

		config.formats.forEach(async (format) => {

			const destFile = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			const cacheFile = asset.cache + `.${format}`;

			if (fs.existsSync(cacheFile)) {
				fs.copyFileSync(cacheFile, destFile);
			} else {
				
				if (format === 'original') {
					fs.copyFileSync(asset.source, asset.dest);
				} else {
					await convertAsset(asset, format);
				}
			}
		});

		if (!config.silent) console.log(chalk.green('Cache hit:'), asset.source);
	});

	//	delete old files
	cacheDiff.removed.forEach(item => {

		const asset = assetsMap.get(item);

		try {
			fs.rmSync(asset.cache);
		} catch (error) {
			if (config.verbose) console.warn(chalk.yellow(`'${asset.source}' already removed`));
		}

		/*try {
			fs.rmSync(asset.dest);
		} catch (error) {
			if (config.verbose) console.log(chalk.yellow(`'${asset.source}' not present in '${config.outputDir}'`));
		}*/

		if (!config.silent) console.log(chalk.yellow(`Removed: '${asset.source}'`));
	});

	cacheIndex.save();

})();
