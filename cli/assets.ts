import { readdirSync, existsSync, mkdirSync, createReadStream, statSync } from 'fs';
import { createHash } from 'crypto';
import { join, basename, resolve, extname, dirname } from 'path';
import { normalizePath } from './utils';

export interface AssetFile {
	slug: string;
	path: string;
	ext: string;
};

export const findAssets = async (assetDir: string, cacheDir: string): Promise<AssetFile[]> => {

	const entries: string[] = [];

	const listDir = (dir: string): void => {

		for (const file of readdirSync(dir)) {
	
			const location = join(dir, file);

			if (location.startsWith(resolve(cacheDir))) {
				continue;
			}

			const locationStat = statSync(location);
			
			if (locationStat.isFile()) {
				entries.push(location);
			} else if (locationStat.isDirectory()) {
				listDir(location);
			}
		}
	};

	const assetDirResolved = resolve(assetDir);

	try {
		listDir(assetDirResolved);
	} catch (_) {
		throw new Error(`Unable to list source directory at: ${assetDir}`);
	}

	return entries.map(item => {

		const slug = normalizePath(resolve(item).slice(assetDirResolved.length));
		const ext = extname(slug);

		return {
			path: item,
			slug: slug.startsWith('/') ? slug.slice(1) : slug,
			ext: ext.startsWith('.') ? ext.slice(1) : ext,
		};
	});
};

export interface AssetEntry extends AssetFile {
	contentHash: string;
};

export const indexAsset = async (item: AssetFile): Promise<AssetEntry> => {
	return Object.assign({
		contentHash: await hashFile(item.path),
	}, item) satisfies AssetEntry;
};

export const hashFile = async (filepath: string): Promise<string> => new Promise(async (resolve, reject) => {

	try {

		if (!existsSync(filepath)) {
			reject(`File does not exsist: ${filepath}`);
		}

		const stream = createReadStream(filepath);
		const hash = createHash('sha256');

		stream.on('error', () => reject(`Error hashing file: ${filepath}`));
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));

	} catch (error) {
		reject(`Error hashing file: ${filepath}`);
	}
});

export interface CacheEntry {
	resolved: string;
};

export type CacheIndex = Map<string, CacheEntry>

export const getCachedAssets = (cacheDir: string): CacheIndex => {

	if (!existsSync(cacheDir)) {
		mkdirSync(cacheDir, { recursive: true });
	}

	const result = new Map<string, CacheEntry>();

	for (const item of readdirSync(cacheDir)) {

		const resolved = join(cacheDir, item);
		if (!statSync(resolved).isFile()) {
			continue
		}

		result.set(basename(item), { resolved });
	}

	return result;
};

export const isModified = async (src: string, dest: string): Promise<boolean> => {

	try {

		const { mtimeMs: srcMtime } = statSync(src);
		const { mtimeMs: destMtime } = statSync(dest);

		return destMtime !== srcMtime;

	} catch (_) {
		return true;
	}
};

export const createDestDir = (destpath: string) => {
	const destDir = dirname(destpath);
	if (!existsSync(destDir)) {
		mkdirSync(destDir, { recursive: true });
	}
};
