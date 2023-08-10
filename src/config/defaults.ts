import { OutputOption } from "../content/types";
import { Config } from './schema';

export const sharpFormats = [ 'png', 'jpeg', 'jpg', 'avif', 'webp', 'gif' ];
export const outputFormats: OutputOption[] = [ 'original', 'webp', 'avif', 'png', 'jpg' ];

export const defaultConfig: Partial<Config> = {
	config: 'ssgassets.config.json',
	verbose: false,
	noCache: false,
	formats: ['original', 'webp', 'avif'],
	exclude: [],
	include: [],
	passtrough: [],
	quality: {
		avif: 80,
		webp: 85,
		jpg: 75,
		png: 85
	}
};
