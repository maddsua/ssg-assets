import type { CacheItem, CacheIndex, OutputFormat, AssetsListItem, CacheDiff, Config } from '../types';
import { existsSync, readFileSync, createReadStream, writeFileSync, mkdirSync } from 'fs';

import { createHash } from 'crypto';
import chalk from 'chalk';

export const indexVersion = 21;

const hashFileContent = async (filepath: string, verbose?: boolean): Promise<string | null> => new Promise(async (resolve) => {

	try {

		if (!existsSync(filepath)) {
			resolve(null);
			return;
		}

		const readStream = createReadStream(filepath);

		//	using md5 for the speeeeeed!
		const hashCtx = createHash('md5');
		const takeOutput = () => hashCtx.digest('hex');

		readStream.on('error', () => {
			if (verbose) console.error(chalk.red(`⚠  Error hashing file: ${filepath}`));
			resolve(null);
		});

		readStream.on('data', (chunk) => hashCtx.update(chunk));
		readStream.on('end', () => resolve(takeOutput()));

	} catch (error) {
		resolve(null);
		if (verbose) console.error(chalk.red(`⚠  Error hashing file: ${filepath}`));
	}
});

export class AssetsCacheIndex {

	cacheFile: string;
	cacheDir: string;
	cacheItemsDir: string;
	assetsDir: string;
	data: Map<string, CacheItem>;
	verbose = false;
	formats: OutputFormat[];

	constructor(config: Config) {

		this.assetsDir = config.inputDir;
		this.verbose = config.verbose;
		this.formats = config.formats.filter(item => item != 'original') as OutputFormat[];

		this.cacheDir = this.assetsDir + '/.cache';
		this.cacheItemsDir = this.cacheDir + '/items';
		this.cacheFile = this.cacheDir + '/index.json';

		this.data = new Map();

		try {

			//	create cache directory
			if (!existsSync(this.cacheItemsDir))
				mkdirSync(this.cacheItemsDir, { recursive: true });

			if (!existsSync(this.cacheFile)) return;
			
			const cacheFileContent = readFileSync(this.cacheFile).toString();
			const cacheIndex = JSON.parse(cacheFileContent) as CacheIndex;

			cacheIndex.entries.forEach(item => this.data.set(item.name, item));

		} catch (error) {
			console.error(chalk.red(`⚠  Failed to load cache index:`), error);
		}
	};

	async diff(assets: AssetsListItem[]): Promise<CacheDiff> {

		const diffResult: CacheDiff = {
			added: [],
			removed: [],
			changed: [],
			hit: []
		};

		let activeEntries = new Set<string>();

		await Promise.all(assets.map(asset => new Promise<void>(async (resolve) => {

			const hash = await hashFileContent(asset.source, this.verbose);

			if (this.data.has(asset.slugHash)) {

				activeEntries.add(asset.slugHash);

				if (this.data.get(asset.slugHash).content !== hash) {

					this.data.set(asset.slugHash, {
						name: asset.slugHash,
						content: hash,
						formats: this.formats
					});
					diffResult.changed.push(asset.slugHash);

				} else  {
					diffResult.hit.push(asset.slugHash);
				}

			} else {

				activeEntries.add(asset.slugHash);
				this.data.set(asset.slugHash, {
					name: asset.slugHash,
					content: hash,
					formats: this.formats
				});
				diffResult.added.push(asset.slugHash);
			}

			resolve();

		})));

		this.data.forEach((_, item) => {
			if (activeEntries.has(item)) return;

			this.data.delete(item);
			diffResult.removed.push(item);
		});

		return diffResult;
	};

	save() {
		try {

			const indexSnapshot: CacheIndex = {
				date: new Date().getTime(),
				version: indexVersion,
				entries: Array.from(this.data.entries()).map(item => item[1])
			};

			if (!existsSync(this.cacheDir))
				mkdirSync(this.cacheDir, { recursive: true });

			writeFileSync(this.cacheFile, JSON.stringify(indexSnapshot));
			
		} catch (error) {
			console.error(chalk.red(`⚠  Failed to save cache index:`), error);
		}
	};
};