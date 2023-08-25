
type ModeModifier = string | null | undefined;
export interface AdaptiveMode {
	media: string;
	modifier: ModeModifier;
};

type ImageFormats = string | string[];

export interface PictireProps {
	src: string;
	alt: string;
	classlist?: string;
	formats?: ImageFormats;
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
	adaptiveModes?: AdaptiveMode[];
};

export interface ImageProps {
	src: string;
	alt: string;
	classlist?: string;
	lazy?: boolean;
	sizes?: number | number[];
	draggable?: boolean;
};

export const supportedFormats = [ 'avif', 'webp', 'png', 'jpg' ];

const applyUrlModifier = (src: string, modifier: ModeModifier) => modifier ? src.replace(/\..*$/, '') + modifier + src.match(/\..*$/)?.[0] : src;

export const adaptBaseImageUrl = (src: string, adaptiveModes?: AdaptiveMode[]) => {
	if (!adaptiveModes || adaptiveModes?.length < 2) return src;
	return applyUrlModifier(src, adaptiveModes[0].modifier);
};

export const mapSources = (src: string, formats?: ImageFormats, adaptiveModes?: AdaptiveMode[]) => {

	const requestedFormats = formats ? (typeof formats === 'string') ? formats.replace('\s','').split(',') : formats : [];
	const imageAltFormats = requestedFormats.filter(format => supportedFormats.some(item => item.toLowerCase() === format));
	
	const sources = imageAltFormats.map(format => ({
		source: `${src.replace(/\.[\w\d]+/, '')}.${format}`,
		type: `image/${format}`,
		media: null as string | null
	}));
	
	const adaptiveSources = adaptiveModes?.map(mode => sources.map(item => ({
		media: `(${mode.media})`,
		source: mode.modifier ? item.source.replace(/\..*$/, '') + mode.modifier + item.source.match(/\..*$/)?.[0] : item.source,
		type: item.type
	}))).flat(1);
	
	return adaptiveSources?.length ? adaptiveSources : sources || [];
};
