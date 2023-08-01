#!/usr/bin/env node

import { loadConfig } from './config/loader';
import { resolveAssets, resolveCachePath } from './content/loader';
import { AssetsCacheIndex } from './content/cache';
import { AssetsListItem, Config, OutputOption } from './types';

import path from 'path';
import fs from 'fs';

import sharp from 'sharp';
import chalk from 'chalk';

const sharpConvertAsset = async (asset: AssetsListItem, format: OutputOption, config: Config): Promise<null | Error> => {

	/**
	 * Yeah, yeah, I'm passing the entire config object here.
	 * JS passes it by reference, so no performance loss here, only more noodle-code.
	 */
			
	try {

		if (format === 'original') {

			fs.copyFileSync(asset.source, asset.dest);
			if (!config.silent) console.log(chalk.green('Cloned original:'), asset.dest);

		} else {

			const dest = asset.dest.replace(/\.[\d\w]+$/, `.${format}`);
			await sharp(asset.source).toFormat(format, { quality: config.quality[format] || 90 }).toFile(dest);
			fs.copyFileSync(dest, asset.cache + `.${format}`);
			if (!config.silent) console.log(chalk.green(`Converted${config.noCache ? '' : ' and cached'}:`), dest);
		}

		return null;

	} catch (error) {
		return error;
	}
}

( async () => {

	const config = loadConfig();
	
	if (config.verbose) {
		console.log('Verbose mode enabled. The tool is extra talkative now.');
		console.log('Current config:', config);
	}
	
	console.log(chalk.bgGreen.black(' Hashing assets... '));

	const assets = resolveAssets(config);

	await (config.noCache ? (async () => {

		await Promise.all(assets.map(async (asset) => {
			config.formats.forEach(async (format) => {
				await sharpConvertAsset(asset, format, config);
			});
		}));

	}) : (async () => {

		const cacheIndex = new AssetsCacheIndex(config);
		const cacheDiff = await cacheIndex.diff(assets);
		const convertJob = [cacheDiff.added, cacheDiff.changed].flat();
		const assetsMap = new Map<string, AssetsListItem>(assets.map(item => [item.slugHash, item]));
	
		await Promise.all(convertJob.map( async (item) => {
	
			const asset = assetsMap.get(item);
			const destdir = path.dirname(asset.dest);
	
			if (!fs.existsSync(destdir))
				fs.mkdirSync(destdir, { recursive: true });
	
			if (asset.action === 'copy') {
	
				fs.copyFileSync(asset.source, asset.dest);
				if (!config.silent) console.log(chalk.green(`Cloned origin: `), asset.source);
	
			} else if (asset.action === 'sharp') {
				await Promise.all(config.formats.map(async (format) => sharpConvertAsset(asset, format, config)));
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
	
				const copyOrigin = format === 'original';
	
				if (fs.existsSync(cacheFile) || copyOrigin) {

					const copy = {
						source: copyOrigin ? asset.source : cacheFile,
						dest: copyOrigin ? asset.dest : destFile
					};

					fs.copyFileSync(copy.source, copy.dest);;
					if (!config.silent) console.log(chalk.green('Cache hit:'), destFile);

				} else {
					await sharpConvertAsset(asset, format, config);
				}
			});
		});
	
		//	delete old files
		cacheDiff.removed.forEach(item => {
	
			const cachePath = resolveCachePath(config.inputDir, item);
	
			try {
				fs.rmSync(cachePath);
			} catch (error) {
				if (config.verbose) console.warn(chalk.yellow(`'${cachePath}' already removed`));
			}
	
			if (!config.silent) console.log(chalk.yellow(`Removed: '${cachePath}'`));
		});
	
		cacheIndex.save();

	}))();

})();
