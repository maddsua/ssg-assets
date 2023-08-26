import { Config } from './schema';

export const defaultConfig: Partial<Config> = {
	config: 'ssgassets.config.json',
	verbose: false,
	noCache: false,
	formats: ['original', 'webp', 'avif'],
	exclude: [],
	include: [],
	passthrough: [],
	quality: {
		avif: 85,
		webp: 85,
		jpg: 80,
		png: 85
	}
};
