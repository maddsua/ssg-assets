
const inputFormatsStruct = [
	'avif',
	'dz',
	'gif',
	'heif',
	'jpeg',
	'jpg',
	'jp2',
	'jxl',
	'png',
	'raw',
	'tiff',
	'tif',
	'webp'
] as const;

export type ImageFormat = typeof inputFormatsStruct[number];
export const imageFormat = inputFormatsStruct as unknown as ImageFormat[];

export type OutputOption = ImageFormat | 'original';
export const outputOption = (imageFormat as OutputOption[]).concat(['original']) ;
