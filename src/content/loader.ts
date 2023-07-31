import { inputFormats, canConvert } from '../config/defaults';

import { createHash } from 'crypto';

import { minimatch } from 'minimatch';
import fs from 'fs';
import type { Config, AssetsListItem } from '../types';

const loadAllSupportedFiles = (assetDir: string): string[] => {
	
	const result = [];

	const listDir = (dir: string) => fs.readdirSync(dir).forEach(file => {
		const location = dir + '/' + file;
		if (location.startsWith(assetDir + '/.cache')) return;
		if (fs.statSync(location).isDirectory()) return listDir(location);
		else if (inputFormats.some(ext => file.endsWith(`.${ext}`))) return result.push(location);
	});
	listDir(assetDir);

	return result.map(item => item.replace(/[\\\/]+/g, '/'));
};

export const resolveAssets = (config: Config): AssetsListItem[] => {

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

	//console.log(entries);

	return entries.map(item => {
		const slug = item.replace(new RegExp('^' + config.inputDir + '/'), '');
		const slugHash = createHash('sha256').update(slug).digest('hex');
		return {
			slug,
			slugHash,
			source: item,
			dest: config.outputDir + '/' + slug,
			cache: config.inputDir + '/.cache/items/' + slugHash,
			action: canConvert.some(item => slug.endsWith(item)) ? 'convert' : 'copy'
		}
	});
};

export default resolveAssets;
