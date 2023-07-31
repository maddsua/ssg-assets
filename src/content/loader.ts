import { inputFormats } from '../config/defaults';

import { globSync } from 'glob';
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
	const entries = loadAllSupportedFiles(srcDir);
	console.log(entries);
};

export default resolveSources;
