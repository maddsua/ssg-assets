import { createDestDir, isModified, type AssetEntry, type AssetFile, type CacheIndex } from "./assets";
import type { RuntimeConfig } from "./config";
import { TransformStatus, transformAsset } from "./transform";

import { copyFileSync, rmSync } from "fs";
import { join } from "path";
import os from 'os';

import chalk from "chalk";
import { splitChunks } from "./utils";

export interface InvocationStats {
	notModified: number;
	cacheHit: number;
	copied: number;
	transformed: number;
	skipped: number;
};

export const copyStaticAssets = async (entries: AssetFile[], stats: InvocationStats, cfg: RuntimeConfig) => {

	if (!entries.length) {
		return;
	}

	if (cfg.verbose) {
		console.log('\nCopying static assets...');
	}

	for (const item of entries) {

		const { slug } = item;

		const destPath = join(cfg.outputDir, item.slug);

		if (!cfg.clearDist && !await isModified(item.path, destPath)) {

			if (cfg.verbose) {
				console.log(chalk.green('Not changed:'), slug);
			}

			stats.notModified++;
			continue;
		}

		createDestDir(destPath);
		copyFileSync(item.path, destPath);

		console.log(chalk.green('Copied:'), slug);
		stats.copied++;
	}
};

export const transformImageAssets = async (entries: AssetEntry[], stats: InvocationStats, cacheIndex: CacheIndex, cfg: RuntimeConfig) => {

	if (!entries.length) {
		return;
	}

	if (cfg.verbose) {
		console.log('\nTransforming images...');
	}

	const batches = splitChunks(entries, os.cpus().length);

	for (const batch of batches) {

		await Promise.all(batch.map(async asset => {

			const result = await transformAsset({ asset, cacheIndex, cfg });

			for (const item of result) {

				const { slug } = item.output;

				switch (item.status) {

					case TransformStatus.NotModified: {

						if (cfg.verbose) {
							console.log(chalk.green('Not changed:'), slug);
						}

						stats.notModified++;
					} break;

					case TransformStatus.Transferred: {
						console.log(chalk.green('Copied:'), slug);
						stats.copied++;
					} break;

					case TransformStatus.CacheHit: {
						console.log(chalk.green('Cache hit:'), slug);
						stats.cacheHit++;
					} break;

					case TransformStatus.Transformed: {
						console.log(chalk.green('Transformed:'), slug);
						stats.transformed++;
					} break;
				}
			}

		}));
	}
};

export const clearUnusedCache = async (cacheIndex: CacheIndex, cfg: RuntimeConfig) => {

	if (!cacheIndex.size) {
		return;
	}

	if (cfg.verbose) {
		console.log('\nCleaning up', cacheIndex.size,  'unused cache entries');
	}

	for (const [_, value] of cacheIndex) {
		rmSync(value.resolved);
	}
};
