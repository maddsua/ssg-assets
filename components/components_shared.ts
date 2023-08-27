
type ModeModifier = string | null | undefined;
type ModeMedia = string | null | undefined;

export interface AdaptiveMode {
	media: ModeMedia;
	modifier: ModeModifier;
};

export type ImageFormats = 'jpg' | 'png' | 'gif' | 'webp' | 'avif';
type ImageFormatsType = ImageFormats | ImageFormats[] | string | string[];
type ImageSizesProp = number | number[];
type ElementClass = string | string[] | Record<string, boolean>;
type ElementStyle = string | Record<string, string | number> | Record<`${string}:${string}`, boolean>;

export interface ImageProps {
	src: string;
	alt: string;
	class?: ElementClass;
	style?: ElementStyle;
	lazy?: boolean;
	sizes?: number | number[];
	draggable?: boolean;
};

export interface PictireProps extends ImageProps {
	formats?: ImageFormatsType;
	adaptiveModes?: AdaptiveMode[];
	imgClass?: ElementClass;
	imgStyle?: ElementStyle;
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

export const classToString = (elemclass?: ElementClass) => {

	if (typeof elemclass === 'string') 
		return elemclass;
	
	else if (Array.isArray(elemclass))
		return elemclass.filter(item => !!item).join(' ');

	else if (typeof elemclass === 'object')
		return Object.entries(elemclass).filter(item => !!item[1]).map(item => item[0]).join(' ');

	return undefined;
};

export const styleToString = (elemstyle?: ElementStyle) => {

	if (typeof elemstyle === 'string') 
		return elemstyle;

	else if (typeof elemstyle === 'object')
		return Object.entries(elemstyle).filter(item => !!item[1]).map(item => typeof item[1] === 'boolean' ? item[0] : `${item[0]}: ${item[1]}`).join('; ');

	return undefined;
};

export const attributeListToString = (attrList: [string, any][]) => attrList.filter(item => typeof item === 'string' || typeof item === 'boolean' || typeof item === 'boolean').map(([attr, value]) => `${attr}="${typeof value === 'string' ? value.replace(/\"/, '\"') : value}"`).join(' ');
