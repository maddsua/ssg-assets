
type ModeModifier = string | null | undefined;
type ModeMedia = string | null | undefined;

export interface AdaptiveMode {
	media: ModeMedia;
	modifier: ModeModifier;
};

type ImageFormats = 'jpg' | 'png' | 'gif' | 'webp' | 'avif';
export type ImageFormatsType = ImageFormats | ImageFormats[] | string | string[];

type ImageSizesProp = number | number[];

export interface ImageProps {
	src: string;
	alt: string;
	classlist?: string;
	lazy?: boolean;
	sizes?: number | number[];
	draggable?: boolean;
};

export interface PictireProps extends ImageProps {
	formats?: ImageFormatsType;
	adaptiveModes?: AdaptiveMode[];
};

export const supportedFormats = [ 'avif', 'webp', 'png', 'jpg' ];

const applyUrlModifier = (src: string, modifier: ModeModifier) => modifier ? src.replace(/\..*$/, '') + modifier + src.match(/\..*$/)?.[0] : src;

export const adaptBaseImageUrl = (src: string, adaptiveModes?: AdaptiveMode[]) => {
	if (!adaptiveModes || adaptiveModes?.length < 2) return src;
	return applyUrlModifier(src, adaptiveModes[0].modifier);
};

export const mapSources = (src: string, formats?: ImageFormatsType, adaptiveModes?: AdaptiveMode[]) => {

	const requestedFormats = formats ? (typeof formats === 'string') ? formats.split(',').map(item => item.trim()) : formats : [];
	const imageAltFormats = requestedFormats.filter(format => supportedFormats.some(item => item.toLowerCase() === format));
	
	const sources = imageAltFormats.map(format => ({
		source: `${src.replace(/\.[\w\d]+/, '')}.${format}`,
		type: `image/${format}`,
		media: undefined as string | undefined
	}));

	if (adaptiveModes?.length === 1) adaptiveModes.push({ media: null, modifier: null });
	
	return adaptiveModes?.length ? adaptiveModes?.map(mode => sources.map(item => ({
		media: mode.media ? `(${mode.media})` : undefined,
		source: applyUrlModifier(item.source, mode.modifier),
		type: item.type
	}))).flat(1) : sources || [];
};

export const getImageSize = (sizes?: ImageSizesProp) => sizes ? (typeof sizes === 'number' ? ({
	width: sizes,
	height: sizes
}) : ({
	width: sizes[0],
	height: sizes?.length >= 2 ? sizes[1] : sizes[0]
})) : undefined;
