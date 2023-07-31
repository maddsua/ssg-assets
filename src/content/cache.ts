import type { CacheIndex, AssetsListItem, CacheDiff } from '../types';
import { existsSync, readFileSync, createReadStream, writeFileSync, mkdirSync } from 'fs';

import { createHash } from 'crypto';
import chalk from 'chalk';

const hashFileContent = async (filepath: string, verbose?: boolean): Promise<string | null> => new Promise(async (resolve) => {

	try {

		if (!existsSync(filepath)) {
			resolve(null);
			return;
		}

		const readStream = createReadStream(filepath);

		//	using md5 for the speeeeeed!
		const hashCtx = createHash('md5');
		const takeOutput = () => hashCtx.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

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

const hashFileName = (filename: string) => {
	const hashCtx = createHash('sha256');
	hashCtx.update(filename);
	return hashCtx.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export class AssetsCacheIndex {

	cacheFile: string;
	cacheDir: string;
	assetsDir: string;
	data: Map<string, string>;
	verbose = false;

	constructor(assetsDir: string, verbose?: boolean) {

		this.assetsDir = assetsDir;
		this.verbose = verbose;
		this.cacheDir = this.assetsDir + '/.cache';
		this.cacheFile = this.cacheDir + '/index.json';
		this.data = new Map();

		try {

			if (!existsSync(this.cacheDir))
				mkdirSync(this.cacheDir, { recursive: true });

			if (!existsSync(this.cacheFile)) return;
			
			const cacheFileContent = readFileSync(this.cacheFile).toString();
			const cacheIndex = JSON.parse(cacheFileContent) as CacheIndex;
			cacheIndex.entries.forEach(item => this.data.set(item[0], item[1]));

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

		await Promise.all(assets.map(asset => new Promise<void>(async (resolve) => {

			const filepath = asset.input;
			const relativeFilePath = filepath.replace(new RegExp('^' + this.assetsDir + '/'), '');
			const hash = await hashFileContent(filepath, this.verbose);

			if (!hash) {

				diffResult.removed.push(relativeFilePath);
				this.data.delete(relativeFilePath);
				/*if (this.verbose)*/ console.log(chalk.yellow(`Removed: '${filepath}'`));

			} else if (this.data.has(relativeFilePath)) {

				if (this.data.get(relativeFilePath) !== hash) {

					this.data.set(relativeFilePath, hash);
					diffResult.changed.push(relativeFilePath);
					/*if (this.verbose)*/ console.log(chalk.green(`Updated: `), filepath);

				} else  {
					/*if (this.verbose)*/ console.log(chalk.green('Not changed:'), filepath);
					diffResult.hit.push(relativeFilePath);
				}

			} else {

				this.data.set(relativeFilePath, hash);
				diffResult.added.push(relativeFilePath);
				/*if (this.verbose)*/ console.log(chalk.green('Added:'), filepath);
			}

			resolve();

		})));

		return diffResult;
	};

	save() {
		try {

			const indexSnapshot: CacheIndex = {
				date: new Date().getTime(),
				version: 2,
				entries: Array.from(this.data.entries())
			};

			if (!existsSync(this.cacheDir))
				mkdirSync(this.cacheDir, { recursive: true });

			writeFileSync(this.cacheFile, JSON.stringify(indexSnapshot));
			
		} catch (error) {
			console.error(chalk.red(`⚠  Failed to save cache index:`), error);
		}
	};

	resolve(filepath: string) {
		return (this.cacheDir + '/' + filepath).replace(/\/+/g, '/');
	}
};