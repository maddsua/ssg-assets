import { OutputOption } from "../content/types";
import { Config } from './schema';

export const inputFormats = [ 'png', 'jpeg', 'jpg', 'avif', 'webp', 'gif' ];
export const sharpFormats = [ 'png', 'jpeg', 'jpg', 'avif', 'webp', 'gif' ];
export const outputFormats: OutputOption[] = [ 'original', 'webp', 'avif', 'png', 'jpg' ];

export const defaultConfig: Partial<Config> = {
	config: 'ssgassets.config.json',
	verbose: false,
	silent: false,
	noCache: false,
	formats: ['original', 'webp', 'avif'],
	exclude: [],
	include: [],
	quality: {
		avif: 80,
		webp: 85,
		jpg: 75,
		png: 85
	}
};
