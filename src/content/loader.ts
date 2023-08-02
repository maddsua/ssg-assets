import { inputFormats, sharpFormats } from '../config/defaults';
import type { AssetsListItem } from './types';
import type { Config } from '../config/schema';
import { getFileHashSha256 } from './hash';

import { normalizePath } from './paths';

import fs from 'fs';

import { minimatch } from 'minimatch';
import chalk from 'chalk';

const loadAllSupportedFiles = (assetDir: string): string[] => {
	
	const result: string[] = [];

	const listDir = (dir: string): void => fs.readdirSync(dir).forEach(file => {
		const location = dir + '/' + file;
		if (location.startsWith(assetDir + '/.cache')) return;
		if (fs.statSync(location).isDirectory()) return listDir(location);
		else if (inputFormats.some(ext => file.endsWith(`.${ext}`))) return result.push(location);
	});

	try {
		listDir(assetDir);
	} catch (_error) {
		throw new Error('Unable to list source directory');;
	}

	return result.map(item => item.replace(/[\\\/]+/g, '/'));
};

export const resolveAssets = async (config: Config): Promise<AssetsListItem[]> => {

	let entries = loadAllSupportedFiles(config.inputDir);

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
		console.error(chalk.red(`⚠  Failed to save cache index:`), error);
		process.exit(1);
	}

	return entries.map((item, index) => {
		const slug = item.replace(new RegExp('^' + config.inputDir + '/'), '');
		return {
			source: item,
			dest: normalizePath(config.outputDir + '/' + slug),
			cache: normalizePath(config.cacheDir + '/' + hashes[index]),
			slug,
			hash: hashes[index],
			action: sharpFormats.some(item => slug.endsWith(item)) ? 'sharp' : 'copy'
		}
	});
};

export default resolveAssets;
