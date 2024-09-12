import type { Config } from "./config";

export const defaultConfig = {
	outputFormats: ['original', 'webp', 'avif'],
	inputDir: './assets',
	outputDir: './public/assets',
} satisfies Config;

export const defaultQuality = {
	avif: 85,
	webp: 85,
	jpg: 80,
	png: 85,
};

export const defaultConfigFiles = [
	'ssgassets.config.json',
	'ssgassets.config.js',
	'ssgassets.config.ts',
	'ssga.config.json',
	'ssga.config.js',
	'ssga.config.ts',
];
