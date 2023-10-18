import fs from 'fs';

export interface CachedAsset {
	hash: string;
	file: string;
}

export const getCachedAssets = (cacheDir: string): CachedAsset[] => {

	if (!fs.existsSync(cacheDir))
		fs.mkdirSync(cacheDir, { recursive: true });

	const cached = fs.readdirSync(cacheDir);

	return cached.filter(item => /^[\d\w]{64}\.[\w\d]+$/.test(item)).map(item => ({
		file: cacheDir + '/' + item,
		hash: item.replace(/\..+$/, '')
	}));
};
