
const inputFormatsStruct = {
	avif: undefined,
	dz: undefined,
	gif: undefined,
	heif: undefined,
	jpeg: undefined,
	jpg: undefined,
	jp2: undefined,
	jxl: undefined,
	png: undefined,
	raw: undefined,
	tiff: undefined,
	tif: undefined,
	webp: undefined
};

export type ImageFormat = keyof typeof inputFormatsStruct;
export const imageFormat = Object.keys(inputFormatsStruct) as ImageFormat[];

export type OutputOption = ImageFormat | 'original';
export const outputOption = (imageFormat as OutputOption[]).concat(['original']) ;
