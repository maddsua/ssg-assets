import { imageFormat } from '../formats';
import type { AssetsListItem } from '../types';
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

	return await Promise.all(entries.map(async (item): Promise<AssetsListItem> => {

		const slug = item.replace(new RegExp('^' + config.inputDir + '/'), '');
		const hash = await getFileHashSha256(item);

		const assetBaseData = {
			source: item,
			dest: normalizePath(config.outputDir + '/' + slug),
			cache: normalizePath(config.cacheDir + '/' + hash),
			slug,
			hash: hash
		};

		const isPasstrough = config.passthrough.some(pattern => minimatch(item, pattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true
		}));
		if (isPasstrough) return Object.assign(assetBaseData, {
			action: 'copy'
		} as const);

		const imageAssetFormat = imageFormat.find(item => slug.endsWith(item));
		if (!imageAssetFormat) return Object.assign(assetBaseData, {
			action: undefined
		} as const);

		return Object.assign(assetBaseData, {
			action: 'sharp',
			format: imageAssetFormat
		} as const);
	}));
};

export default resolveAssets;
