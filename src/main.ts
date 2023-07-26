#!/usr/bin/env node

import path from "path";
import fs from 'fs';
import { createHash } from "crypto";

import sharp from 'sharp';
import chalk from 'chalk';
import { globSync } from 'glob';
import { minimatch } from 'minimatch';

interface i_cache {
	fname: string,
	fhash: string
};

interface i_cachedb {
	compare: Array <i_cache>,
	current: Array <i_cache>
};

let cacheDB: i_cachedb = {
	compare: [],
	current: []
};

const cachedObjects = Array<string>(0);

let pathsInput: string = '';

const flags = {
	verbose: false,
	nocache: false,
	justCopy: false
};

const formatsArgPrefix = '--formats=';
const knownFormats = [
	'original',
	'webp',
	'avif'
];
let useFormats = knownFormats;

const loadFormats = (input: string) => {

	const options = input.slice(formatsArgPrefix.length).split(',').filter((item) => item.length);
	if (!options.length) {
		console.error(chalk.red(' Provided formats list is invalid '));
		console.warn('Use this syntax:', chalk.green(`  ${formatsArgPrefix}original,webp... `))
		process.exit(1);
	}

	options.forEach((item) => knownFormats.some((item1) => item === item1) ? undefined : console.warn(chalk.yellow('Unknown format option:'), item));
	if (!options.filter((item) => knownFormats.some((item1) => item === item1)).length) {
		console.error(chalk.red('No supported formats specified. Aborting.'));
		process.exit(1);
	}

	useFormats = options;
}

process.argv.slice(2).forEach((arg) => {

	if (/^.+\:.+$/.test(arg)) pathsInput = arg;
	else if (arg === '-v' || arg === '--verbose') flags.verbose = true;
	else if (arg === '-n' || arg === '--no-cache') flags.nocache = true;
	else if (arg === '-c' || arg === '--copy') flags.justCopy = true;
	else if (arg.startsWith(formatsArgPrefix)) (loadFormats(arg));
});

if (!pathsInput.length) {
	console.error('Run this script like this: node assets.mjs [input dir]:[output dir]')
	process.exit(1);
}

if (flags.nocache) console.log(chalk.yellow('Cache is disabled'));

let assetsInput = path.normalize(pathsInput.slice(0, pathsInput.indexOf(':')));
let assetsOutput = path.normalize(pathsInput.slice(pathsInput.indexOf(':') + 1));

const assetsCacheFolder = path.normalize(assetsInput + '/.cache/');
if (!fs.existsSync(assetsCacheFolder)) fs.mkdirSync(assetsCacheFolder, {recursive: true});
const cacheIndex = path.normalize(assetsCacheFolder + '/.cacheindex.json');

if (!flags.nocache) {
	try {
		cacheDB.compare = JSON.parse(new TextDecoder().decode(fs.readFileSync(cacheIndex)));
		if (!Array.isArray(cacheDB.compare)) cacheDB.compare = [];
		if (!Array.isArray(cacheDB.current)) cacheDB.current = [];
	} catch (error) {
		console.log('No cache found');
	}
}

const quality = {
	avif: 80,
	webp: 85,
	jpg: 75,
	png: 85
};

console.log('Starting media assets processing...');

interface i_asset {
	source: string,
	dest: string,
	destNoExt: string,
	destDir: string,
	name: string,
	cachePath: string
}

let assetFiles: Array <i_asset> = globSync(path.normalize(assetsInput + '/**/*').replace(/\\/g, '/'), { nodir: true }).map((assetPath) => {

	assetPath = path.normalize(assetPath);
	const destpath = assetPath.replace(path.normalize(assetsInput + '/'), path.normalize(assetsOutput + '/'));

	const noextension = (path: string) => path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : path;
	
	return {
		source: assetPath,
		dest: destpath,
		destNoExt: noextension(destpath),
		destDir: path.dirname(destpath),
		name: path.basename(assetPath),
		cachePath: noextension(assetPath.replace(path.normalize(assetsInput + '/'), path.normalize(assetsInput + '/.cache/')))
	}

});

if (!assetFiles.length) {
	console.error(chalk.black.bgRed(' No assets found '), `in "${assetsInput}"`);
	process.exit(2);
}

interface i_globdirective {
	globRoot: string,
	pattern: string
}
interface i_noassets {
	globPath: string,
	directives: i_globdirective[]
};


const noassetsDirective: Array <i_noassets> = globSync('./**/.noassets').map((item) => {

	try {
		
		const fileContents = fs.readFileSync(item).toString();

		const cfgFileAllLines = fileContents.split('\n').filter((line) => line.replace(/[^\w\d]/g, '').length > 1).map((item1) => item1.replace(/^[\s\r]+/, '').replace(/[\s\r]+$/, ''));

		const directives: i_globdirective[] = cfgFileAllLines.filter((item1) => !item1.startsWith('#')).map((item1) => ({
			globRoot: path.dirname(item).replace(/[\\\/]+/, '/'),
			pattern: item1.replace(/[\\\/]+/, '/').replace(/^\//, './')
		}));

		return {
			globPath: item,
			directives
		}

	} catch (_error) {

		return {
			globPath: item,
			directives: []
		}
	}

}).filter((item) => item.directives.length);

const queue = assetFiles.map(async (asset) => {

	if (noassetsDirective.some((item) => {

		//	check if this .noassets has power over this asset
		const patchMatch = asset.source.startsWith(path.normalize(item.globPath.replace(/[\/\\].noassets$/, '/')));
		//	if not, skip it
		if (!patchMatch) return false;

		return item.directives.some((item1) => {

			//	create path relative to .noassets file, so that globs will work as intended
			const relativePath = asset.source.substring(item1.globRoot.length + 1);

			if (!item1.pattern.endsWith('*')) (() => {
				//	create relative path
				const checkIfDir = path.join(item1.globRoot, item1.pattern);
				
				if (!fs.existsSync(checkIfDir)) return;

				//	if path exists, check if it's a dir
				if (!fs.statSync(checkIfDir).isDirectory()) return;

				//	it' a dir. ensure glob has a slash before asterisk
				item1.pattern += item1.pattern.endsWith('/') ? '*' : '/*';

			})();


			//	if glob matches - asset is skipped
			return minimatch(relativePath, item1.pattern, {
				matchBase: true,
				nobrace: true,
				noext: true,
				nocase: true
			});

		});

	})) {
		if (flags.verbose) console.log(' Skipped by the ".noassets" :', asset.source);
		return;
	}

	let isCacheValid = false;
	
	if (!fs.existsSync(asset.destDir)) fs.mkdirSync(asset.destDir, {recursive: true});

	const contentHash: string | null = flags.nocache ? null : await (async () => new Promise <string | null> (async (hashResolve) => {

		//	using md5 for the speeeeeed!
		const hash = createHash('md5');

		await (() => new Promise <boolean> ((resolve) => {
	
			const readStream = fs.createReadStream(asset.source);
			
			readStream.on('error', () => {
				console.error('Error hashing file:', asset.source);
				resolve(false);
			});

			readStream.on('data', (chunk) => hash.update(chunk));
			readStream.on('end', () => resolve(true));

		}))() ? hashResolve(hash.digest('base64').replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")) : null;

	}))();
	
	const fnameHash: string | null = flags.nocache ? null : (() => {
		const hash = createHash('sha256');
			hash.update(asset.source);
		return hash.digest('base64').replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
	})();

	if (contentHash) {
		const compareHash = cacheDB.compare.find((item) => item.fname === fnameHash);
		if (compareHash) isCacheValid = compareHash?.fhash ? (compareHash.fhash === contentHash) : false;
		cacheDB.current.push({fname: fnameHash, fhash: contentHash});
	}

	const getCacheFileName = (file: string) => file.replace(assetsOutput, assetsCacheFolder);

	const cacheGrab = (file: string, cacheFile: string) => {
		if (!fs.existsSync(cacheFile)) return false;
		fs.copyFileSync(cacheFile, file);
		return true;
	}

	const processAndCache = async (filePathNoExt: string, format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo) => {

		const filePathFull = `${filePathNoExt}.${format}`;
		const cachePath = getCacheFileName(filePathFull);
		cachedObjects.push(path.normalize(cachePath));
		
		if (!fs.existsSync(filePathFull) || !isCacheValid) {
			
			const cacheDir = path.dirname(cachePath);
			
			if (!isCacheValid || !cacheGrab(filePathFull, cachePath)) {
				
				await sharp(asset.source).toFormat(format, {quality: quality.avif}).toFile(filePathFull);
				console.log(chalk.cyan(' Converted' + (flags.nocache ? '' : ' and cached') + ' :'), filePathFull);
				
				if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, {recursive: true});
				fs.copyFileSync(filePathFull, cachePath);

			} else console.log(chalk.green(' Cache hit :'), filePathFull);

		} else console.log(chalk.green(' Not changed :'), filePathFull);

		return true;
	}

	if (!flags.justCopy && (/\.(png)|(jpg)$/).test(asset.name)) {

		try {
		
			if (useFormats.some((item) => item === 'avif'))
				await processAndCache(asset.destNoExt, 'avif');

			if (useFormats.some((item) => item === 'webp'))
				await processAndCache(asset.destNoExt, 'webp');
	
			if (useFormats.some((item) => item === 'original'))
				await processAndCache(asset.destNoExt, /\.png$/.test(asset.name) ? 'png' : 'jpg');
	
		} catch (error) {
			console.error(chalk.black.bgRed(' Sharp error on: '), asset.source);
			console.error(chalk.red('Details:'), error);
			process.exit(11);
		}

	} else {

		if (!fs.existsSync(asset.dest) || !isCacheValid) {	
				
			if (!fs.existsSync(asset.destDir)) fs.mkdirSync(asset.destDir, {recursive: true});
			fs.copyFileSync(asset.source, asset.dest);

			console.log(chalk.cyan(' Copied origin: '), asset.dest);

		} else console.log(chalk.green(' Not changed :'), asset.dest);
	
	}
});

await Promise.all(queue);

//	cache cleanup and index save
const cachePostprocess = () => {

	const cacheContents = globSync(path.normalize(assetsCacheFolder + '/**/*').replace(/\\/g, '/'), {nodir: true}).map((entry) => path.normalize(entry));

	cacheContents.forEach((file) => {
		if (!cachedObjects.find((entry) => entry === file)) {
			fs.rmSync(file);
			console.log(chalk.yellow(' Removed from cache: '), file);
		}
	});

	//	save index
	fs.writeFileSync(cacheIndex, JSON.stringify(cacheDB.current));
};
if (!flags.nocache) cachePostprocess();

console.log('Assets processing done!');