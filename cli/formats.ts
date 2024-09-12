
const imageInputs = [
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

export type ImageFormat = typeof imageInputs[number];
export const imageFormatProto = imageInputs as unknown as ImageFormat[];
export const imageFormats = new Set<string>(imageFormatProto);

export type OutputFormat = ImageFormat | 'original';
export const outputOptions = new Set<string>((imageFormatProto as string[]).concat(['original']));
