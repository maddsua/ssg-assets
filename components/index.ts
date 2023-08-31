
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

export const supportedFormats = [ 'avif', 'webp', 'png', 'jpg', 'gif' ];

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

export type HTMLAttributeValue = boolean | number | string | null | undefined;
export type HTMLAttribStruct = Record<string, HTMLAttributeValue>;

export const composeAttributesHTML = (attrList: HTMLAttribStruct) => Object.entries(attrList).filter(item => ['string', 'boolean', 'number'].some(typeid => typeid === typeof item[1])).map(([attr, value]) => `${attr}="${typeof value === 'string' ? value.replace(/\"/, '\"') : value}"`).join(' ');

export const attributeListToString = (attrList: [string, any][]) => attrList.filter(([_attr, value]) => typeof value === 'string' || typeof value === 'boolean' || typeof value === 'boolean').map(([attr, value]) => `${attr}="${typeof value === 'string' ? value.replace(/\"/, '\"') : value}"`).join(' ');

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

export const asyncSleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));

export const revealLazyLoaded = (root?: HTMLElement | Element | null, componentID?: string) => {

	const lazyImages = (root || document).querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
	const attachToImages = componentID ? Array.from(lazyImages).filter(item => item.getAttribute('data-component-id') === componentID) : lazyImages;

	attachToImages.forEach(image => {

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
