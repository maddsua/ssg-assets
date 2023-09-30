import type { ConfigSchema } from './schema';

export const configFileNames = [
	'./ssgassets.config.json',
	'./ssgassets.config.js',
	'./ssgassets.config.ts',
	'./ssga.config.json',
	'./ssga.config.js',
	'./ssga.config.ts'
];

export const defaultConfig: ConfigSchema = {
	configFile: null,
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
