import { inputFormats } from '../config/defaults';

import { minimatch } from 'minimatch';
import path from 'path';
import fs from 'fs';

const loadAllSupportedFiles = (directory: string) => {
	const result = [];
	const listDir = (dirpath: string) => fs.readdirSync(dirpath).forEach(file => {
		const location = path.join(dirpath, file);
		if (fs.statSync(location).isDirectory()) return listDir(location);
		else if (inputFormats.find(ext => file.endsWith(`.${ext}`))) result.push(location);
	});
	listDir(directory);
	return result.map(item => item.replace(/[\\\/]+/g, '/'));
};

export const resolveSources = (srcDir: string, includes: string[], excludes: string[]) => {

	let entries = loadAllSupportedFiles(srcDir);

	includes.forEach(item => entries = entries.filter(entry => minimatch(entry, item, {
		matchBase: true,
		nobrace: true,
		noext: true,
		nocase: true
	})));

	excludes.forEach(item => entries = entries.filter(entry => !minimatch(entry, item, {
		matchBase: true,
		nobrace: true,
		noext: true,
		nocase: true
	})));

	//console.log(entries);

	return entries;
};

export default resolveSources;
