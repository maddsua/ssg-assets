import { createDestDir, isModified, type AssetEntry, type AssetFile, type CacheIndex } from "./assets";
import type { RuntimeConfig } from "./config";
import { TransformStatus, transformAsset } from "./transform";

import { copyFileSync } from "fs";
import { join } from "path";

import chalk from "chalk";

export interface InvocationStats {
	notModified: number;
	cacheHit: number;
	copied: number;
	transformed: number;
	skipped: number;
};


export const printStats = (stats: InvocationStats) => {

	if (stats.transformed) {
		console.log('Transformed:', stats.transformed, 'images');
	}

	if (stats.cacheHit) {
		console.log('Cache hits:', stats.cacheHit);
	}

	if (stats.copied) {
		console.log('Copied:', stats.copied, 'assets');
	}

	if (stats.notModified) {
		console.log('Verified:', stats.notModified, 'assets');
	}

	if (stats.skipped) {
		console.log('Skipped:', stats.skipped, 'images');
	}
};


export const copyStaticAssets = async (entries: AssetFile[], stats: InvocationStats, cfg: RuntimeConfig) => {

	for (const item of entries) {

		const { slug } = item;

		const destPath = join(cfg.outputDir, item.slug);

		if (!await isModified(item.path, destPath)) {
			console.log(chalk.green('Not changed:'), slug);
			stats.notModified++;
			continue;
		}

		createDestDir(destPath);
		copyFileSync(item.path, destPath);

		console.log(chalk.green('Copied:'), slug);
		stats.copied++;
	}
};

export const transformImageAssets = async (batches: AssetEntry[][], stats: InvocationStats, cacheIndex: CacheIndex, cfg: RuntimeConfig) => {

	for (const batch of batches) {

		await Promise.all(batch.map(async asset => {

			const result = await transformAsset({ asset, cacheIndex, cfg });

			for (const item of result) {

				const { slug } = item.output;

				switch (item.status) {

					case TransformStatus.NotModified: {
						console.log(chalk.green('Not changed:'), slug);
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
