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

export interface ProgressMetrics {
	current: number;
	total: number;
};

const printStatus = (progress: ProgressMetrics, status: string, asset: string) =>
	console.log(chalk.blue(`(${progress.current}/${progress.total})`), chalk.green(`${status}:`), asset);

export const copyStaticAssets = async (entries: AssetFile[], stats: InvocationStats, progress: ProgressMetrics, cfg: RuntimeConfig) => {

	if (!entries.length) {
		return;
	}

	if (cfg.verbose) {
		console.log('Copying static assets...');
	}

	for (const item of entries) {

		progress.current++;

		const { slug } = item;

		const destPath = join(cfg.outputDir, item.slug);

		if (!cfg.clearDist && !await isModified(item.path, destPath)) {

			if (cfg.verbose) {
				printStatus(progress, 'Not changed', slug);
			}

			stats.notModified++;
			continue;
		}

		createDestDir(destPath);
		copyFileSync(item.path, destPath);

		printStatus(progress, 'Copied', slug);
		stats.copied++;
	}

	if (cfg.verbose) {
		console.log('\r');
	}
};

export const transformImageAssets = async (entries: AssetEntry[], stats: InvocationStats, progress: ProgressMetrics, cacheIndex: CacheIndex, cfg: RuntimeConfig) => {

	if (!entries.length) {
		return;
	}

	if (cfg.verbose) {
		console.log('Transforming images...');
	}

	const batches = splitChunks(entries, cfg.concurrency);

	for (const batch of batches) {

		await Promise.all(batch.map(async asset => {

			const result = await transformAsset({ asset, cacheIndex, cfg });

			for (const item of result) {

				progress.current++;

				const { slug } = item.output;

				switch (item.status) {

					case TransformStatus.NotModified: {

						if (cfg.verbose) {
							printStatus(progress, 'Not changed', slug);
						}

						stats.notModified++;
					} break;

					case TransformStatus.Transferred: {
						printStatus(progress, 'Copied', slug);
						stats.copied++;
					} break;

					case TransformStatus.CacheHit: {
						printStatus(progress, 'Cache hit', slug);
						stats.cacheHit++;
					} break;

					case TransformStatus.Transformed: {
						printStatus(progress, 'Transformed', slug);
						stats.transformed++;
					} break;
				}
			}

		}));
	}

	if (cfg.verbose) {
		console.log('\r');
	}
};

export const clearUnusedCache = async (cacheIndex: CacheIndex, cfg: RuntimeConfig) => {

	if (!cacheIndex.size) {
		return;
	}

	if (cfg.verbose) {
		console.log('\nCleaning up', cacheIndex.size, 'unused cache entries');
		console.log('\r');
	}

	for (const [_, value] of cacheIndex) {
		rmSync(value.resolved);
	}
};
