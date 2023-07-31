#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

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
	
	const assets = resolveAssets(config);
	
	const cacheIndex = new AssetsCacheIndex(config.inputDir, config.verbose);

	const cacheDiff = await cacheIndex.diff(assets);

	//if (config.verbose)
	//	console.log('Cache diff:', cacheDiff);

	cacheIndex.save();

})();
