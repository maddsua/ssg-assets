import { OutputOption } from "../types";

export const inputFormats = [ 'png', 'jpeg', 'jpg', 'avif', 'webp', 'gif' ];

export const canConvert = [ 'png', 'jpeg', 'jpg', 'avif', 'webp', 'gif' ];

export const outputFormats: OutputOption[] = [ 'original', 'webp', 'avif', 'png', 'jpg' ];

export const outputQuality = {
	avif: 80,
	webp: 85,
	jpg: 75,
	png: 85
};
