import { sharpFormats } from '../config/defaults';
import type { AssetsListItem } from './types';
import type { Config } from '../config/schema';
import { getFileHashSha256 } from './hash';

import { normalizePath } from './paths';

import fs from 'fs';

import { minimatch } from 'minimatch';
import chalk from 'chalk';

const loadAllAssetFiles = (assetDir: string): string[] => {
	
	const result: string[] = [];

	const listDir = (dir: string): void => fs.readdirSync(dir).forEach(file => {
		const location = dir + '/' + file;
		if (location.startsWith(assetDir + '/.cache')) return;
		if (fs.statSync(location).isDirectory()) return listDir(location);
		else return result.push(location);
	});

	try {
		listDir(assetDir);
	} catch (_error) {
		throw new Error('Unable to list source directory');;
	}

	return result.map(item => item.replace(/[\\\/]+/g, '/'));
};

export const resolveAssets = async (config: Config): Promise<AssetsListItem[]> => {

	let entries = loadAllAssetFiles(config.inputDir);

	config.include.forEach(item => entries = entries.filter(entry => minimatch(entry, item, {
		matchBase: true,
		nobrace: true,
		noext: true,
		nocase: true
	})));

	config.exclude.forEach(item => entries = entries.filter(entry => !minimatch(entry, item, {
		matchBase: true,
		nobrace: true,
		noext: true,
		nocase: true
	})));

	let hashes: string[] = [];

	try {
		hashes = await Promise.all(entries.map(item => getFileHashSha256(item)));
	} catch (error) {
		console.error(chalk.red(`⚠  Failed to hash asset file:`), error);
		process.exit(1);
	}

	return entries.map((item, index): AssetsListItem => {

		const slug = item.replace(new RegExp('^' + config.inputDir + '/'), '');

		const isPasstrough = config.passthrough.some(pattern => minimatch(item, pattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true
		}));

		const sharpInput = sharpFormats.some(item => slug.endsWith(item));

		return {
			source: item,
			dest: normalizePath(config.outputDir + '/' + slug),
			cache: normalizePath(config.cacheDir + '/' + hashes[index]),
			slug,
			hash: hashes[index],
			action: (sharpInput && !isPasstrough) ? 'sharp' : (isPasstrough ? 'copy' : undefined)
		}
	});
};

export default resolveAssets;
