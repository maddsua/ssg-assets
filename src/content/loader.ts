import { inputFormats } from '../config/defaults';

import { minimatch } from 'minimatch';
import path from 'path';
import fs from 'fs';
import { Config } from '../types';

const loadAllSupportedFiles = (directory: string): string[] => {
	const result = [];
	const listDir = (dirpath: string) => fs.readdirSync(dirpath).forEach(file => {
		const location = path.join(dirpath, file);
		if (fs.statSync(location).isDirectory()) return listDir(location);
		else if (inputFormats.find(ext => file.endsWith(`.${ext}`))) result.push(location);
	});
	listDir(directory);
	return result.map(item => item.replace(/[\\\/]+/g, '/'));
};

export const resolveAssets = (config: Config) => {

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

	return entries.map(item => ({
		input: item,
		output: item.replace(new RegExp('^' + config.inputDir), config.outputDir)
	}))
};

export default resolveAssets;
