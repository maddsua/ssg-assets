
/**
 * This text literal should be replaced by the bundler
 * in case u want to force static hosting cache invalidated on new deploy
 */
const deployHashLiteral = `__SSGA_DEPLOY_CACHE_HASH__`;
const assetsVersionQuery = deployHashLiteral.startsWith('_') ? '' : `?w=${deployHashLiteral.replace(/[^\w\-\_]+/g, '')}`;

export const applyImageSrc = (assetSrc: string) => (!assetSrc.includes('?') && assetsVersionQuery) ? assetSrc + assetsVersionQuery : assetSrc;

type ModeModifier = string | null | undefined;
type ReplaceBaseModifier = string | RegExp | undefined;
type AdaptiveModeMediaQuery = string | null | undefined;

export interface AdaptiveModeVariant {
	media: AdaptiveModeMediaQuery;
	modifier: ModeModifier;
};

export interface AdaptiveMode {
	baseModifier?: ReplaceBaseModifier;
	variants: AdaptiveModeVariant[];
};

export type ImageFormats = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'avif';
type ImageFormatsType = string | string[];
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
	adaptiveMode?: AdaptiveMode;
	imgClass?: ElementClass;
	imgStyle?: ElementStyle;
};

export const supportedFormats: ImageFormats[] = [ 'avif', 'webp', 'png', 'jpg', 'jpeg', 'gif' ];

const filePathNoExtension = (filepath: string) => {
	const dotPosition = filepath.lastIndexOf('.');
	if (dotPosition === -1) return filepath;
	return filepath.slice(0, dotPosition);
};

const getPathExtension = (filepath: string) => {
	const dotPosition = filepath.lastIndexOf('.');
	if (dotPosition === -1) return '';
	return filepath.slice(dotPosition + 1);
};

const applyUrlModifier = (imageUrl: string, modifier: ModeModifier, baseModifier: ReplaceBaseModifier) => {
	if (!modifier) return imageUrl;
	if (!baseModifier) return `${filePathNoExtension(imageUrl)}${modifier}.${getPathExtension(imageUrl)}`;
	return imageUrl.replace(baseModifier, modifier);
};

export interface SourceMapEntry {
	source: string;
	type: string;
	media?: string;
};

export const mapSources = (baseImageSrc: string, formats?: ImageFormatsType, adaptiveMode?: AdaptiveMode): SourceMapEntry[] => {

	const requestedFormats = formats ? (typeof formats === 'string') ? formats.split(',').map(item => item.trim().toLowerCase()) : formats : [];
	const imageAltFormats = supportedFormats.map(item_s => requestedFormats.find(item_r => item_s === item_r)).filter(item => !!item) as string[];

	const queryParamsStart = baseImageSrc.indexOf('?');
	const hasQueryParams = queryParamsStart !== -1;

	const urlNoSearch = hasQueryParams ? baseImageSrc.slice(0, queryParamsStart) : baseImageSrc;
	const queryParams = hasQueryParams ? baseImageSrc.slice(queryParamsStart) : assetsVersionQuery;

	const altFormatSources = imageAltFormats.map(format => ({
		source: `${filePathNoExtension(urlNoSearch)}.${format}${queryParams}`,
		type: `image/${format}`
	}));

	if (!adaptiveMode?.variants?.length) return altFormatSources;

	//	Ensures that in the case then only a single adaptive variant is provided we won't lose the default image alt formats
	const adaptiveVariants = adaptiveMode.variants.length > 1 ? adaptiveMode.variants : adaptiveMode.variants.concat({ media: undefined, modifier: undefined });
	
	//	Map alt formats (like webp, avif) to their adaptive modes (including leaving an empty media query option, it's important!)
	const adaptiveAltFormats = altFormatSources.map(source => adaptiveVariants.map(variant => ({
		media: variant.media ? variant.media : undefined,
		source: applyUrlModifier(source.source, variant.modifier, adaptiveMode.baseModifier),
		type: source.type
	}))).flat(1);

	//	Map base image to it's adaptive modes. it will leave an option with identical URL to the base image,
	//	a filter is used to remove this afterwards
	const adaptiveBaseFormat = adaptiveVariants.map(variant => ({
		media: variant.media ? variant.media : undefined,
		source: applyUrlModifier(baseImageSrc, variant.modifier, adaptiveMode.baseModifier),
		type: `image/${getPathExtension(baseImageSrc)}`
	})).filter(item => item.source !== baseImageSrc);

	//	Return a flattened array of all options, with media-less sourced at the end
	//	This is important to keep them at the end, as a browser will pick the first option that matches
	//	it's supported formats list. And we want all media-specific sources to be accessible
	return [adaptiveAltFormats, adaptiveBaseFormat].flat(1).sort((prev, next) => {
		if (!prev.media && next.media) return 1;
		else if (prev.media && !next.media) return -1;
		else return 0;
	});
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

export type HTMLAttributeValue = boolean | number | string | null | undefined;
export type HTMLAttribStruct = Record<string, HTMLAttributeValue>;

export const composeAttributesHTML = (attrList: HTMLAttribStruct) => Object.entries(attrList).filter(item => ['string', 'boolean', 'number'].some(typeid => typeid === typeof item[1])).map(([attr, value]) => `${attr}="${typeof value === 'string' ? value.replace(/\"/, '\"') : value}"`).join(' ');

interface GetDOMRoot {
	domRoot: Document;
	isNativeDOM: boolean;
};

export const getDOMRoot = (customDOMRoot?: Document): GetDOMRoot => {

	if (typeof document === 'undefined') {

		if (!customDOMRoot) throw new Error('Looks like you\'re not running in the browser, so you need to provide a different Document (document root) object to the component. Or use the "html" version of the component to bypass this requirement');

		return { domRoot: customDOMRoot, isNativeDOM: false };
	}

	if (customDOMRoot) console.warn('Yo dawg, it seems like you\'re running getDOMRoot() in a browser with a customDOMRoot specified. You probably don\'need it, the global document object will be used instead');

	return { domRoot: document, isNativeDOM: true };
};

export const revealLazyLoaded = (root?: HTMLElement | Element | null) => {

	const lazyImages = (root || document).querySelectorAll<HTMLImageElement>('img[loading="lazy"]');

	const asyncSleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));

	lazyImages.forEach(image => {

		if (image.complete) return;

		image.style.opacity = '0';

		image.onload = async () => {
			
			image.style.transition = `opacity 500ms ease`;
			await asyncSleep(100);
			image.style.opacity = '1';
			
			await asyncSleep(500);
			image.style.transition = '';
			image.style.opacity = '';
		};
	});
};
