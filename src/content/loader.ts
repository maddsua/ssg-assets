import { imageFormat } from '../config/formats';
import type { ImageFormat } from '../config/formats';
import type { ConfigSchema } from '../config/schema';
import { getFileHashSha256 } from './hash';

import { normalizePath } from './paths';

import fs from 'fs';

import { minimatch } from 'minimatch';

interface AssetListBaseItem {
	source: string;
	dest: string;
	cache: string;
	slug: string;
	hash: string;
	message?: string;
};

interface AssetListSharpItem extends AssetListBaseItem {
	format: ImageFormat;
	action: 'sharp';
};
interface AssetListCopyItem extends AssetListBaseItem {
	action: 'copy';
};
interface AssetListNoActionItem extends AssetListBaseItem {
	action: null | undefined;
};

export type AssetsListItem = AssetListSharpItem | AssetListCopyItem | AssetListNoActionItem;

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

export const resolveAssets = async (config: ConfigSchema): Promise<AssetsListItem[]> => {

	let allAvailableFiles = loadAllAssetFiles(config.inputDir);

	return await Promise.all(allAvailableFiles.map(async (assetPath): Promise<AssetsListItem> => {

		const slug = assetPath.replace(new RegExp('^' + config.inputDir + '/'), '');
		const hash = await getFileHashSha256(assetPath);

		const assetBaseData = {
			source: assetPath,
			dest: normalizePath(config.outputDir + '/' + slug),
			cache: normalizePath(config.cacheDir + '/' + hash),
			slug,
			hash: hash
		};

		const isNotIncluded = config.include.length && !config.include.some(includePattern => minimatch(assetPath, includePattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true
		}));
		if (isNotIncluded) return Object.assign(assetBaseData, {
			action: undefined,
			message: 'not included'
		} as const);

		const isExcluded = config.exclude.some(excludePattern => minimatch(assetPath, excludePattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true
		}));
		if (isExcluded) return Object.assign(assetBaseData, {
			action: undefined,
			message: 'excluded'
		} as const);

		const imageAssetFormat = imageFormat.find(item => slug.endsWith(item));
		if (imageAssetFormat) return Object.assign(assetBaseData, {
			action: 'sharp',
			format: imageAssetFormat
		} as const);
		
		return Object.assign(assetBaseData, {
			action: 'copy'
		} as const);

	}));
};

export default resolveAssets;
