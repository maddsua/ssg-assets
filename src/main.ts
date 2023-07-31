#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

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
	
	console.log(chalk.bgGreen.black(' Hashing assets... '));

	const assets = resolveAssets(config);
	const assetsMap = new Map<string, AssetsListItem>(assets.map(item => [item.input, item]));
	const cacheIndex = new AssetsCacheIndex(config.inputDir, config.verbose);
	const cacheDiff = await cacheIndex.diff(assets);

	//	convert changed assets
	[cacheDiff.added, cacheDiff.changed].flat().forEach(item => {

		const asset = assetsMap.get(item);
		const destdir = path.dirname(asset.output);

		if (!fs.existsSync(destdir))
			fs.mkdirSync(destdir, { recursive: true });

		console.log(asset);
		fs.copyFileSync(asset.input, asset.output);
	});

	//if (config.verbose)
	//	console.log('Cache diff:', cacheDiff);

	cacheIndex.save();

})();
