import fs from 'fs';

interface Cached {
	hash: string;
	file: string;
}

export const getCachedAssets = (cacheDir: string): Cached[] => {

	if (!fs.existsSync(cacheDir))
		fs.mkdirSync(cacheDir);

	const cached = fs.readdirSync(cacheDir);

	return cached.filter(item => /^[\d\w]{64}\.[\w\d]+$/.test(item)).map(item => ({
		file: cacheDir + '/' + item,
		hash: item.replace(/\..+$/, '')
	}));
}
