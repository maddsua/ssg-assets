import { CacheItem, CacheIndex } from '../types';
import { existsSync, readFileSync } from 'fs';

import path from 'path';
import chalk from 'chalk';

export class AssetsCacheIndex {

	cacheFile: string;
	data: Map<string, string>;

	constructor(assetsDir: string) {

		this.cacheFile = assetsDir + '/.cache.json';
		this.data = new Map();

		try {

			if (!existsSync(this.cacheFile)) return;
			
			const cacheFileContent = readFileSync(this.cacheFile).toString();
			const cacheIndex = JSON.parse(cacheFileContent) as CacheIndex;

			cacheIndex.entries.forEach(item => this.data.set(item.fileName, item.contentHash));

		} catch (error) {
			console.error(chalk.yellow(`⚠  Failed to load cache index:`), error);
		}
	};

};