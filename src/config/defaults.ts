import type { ConfigSchema } from './schema';

export const defaultConfig: ConfigSchema = {
	configFile: './ssgassets.config.json',
	verbose: false,
	noCache: false,
	resetCache: false,
	formats: ['original', 'webp', 'avif'],
	inputDir: './assets',
	outputDir: './public/assets',
	cacheDir: './assets/.cache',
	exclude: [],
	include: [],
	quality: {
		avif: 85,
		webp: 85,
		jpg: 80,
		png: 85
	}
};
