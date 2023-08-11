export interface AdaptiveMode {
	media: string;
	modifier: string | null | undefined;
}

type ImageFormats = string | string[];

export interface Props {
	src: string;
	alt: string;
	classlist?: string;
	formats?: ImageFormats;
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
	adaptiveModes?: AdaptiveMode[];
}

export const supportedFormats = [ 'avif', 'webp', 'png', 'jpg' ];

export const mapSources = (src: string, formats?: ImageFormats, adaptiveModes?: AdaptiveMode[]) => {

	const requestedFormats = formats ? (typeof formats === 'string') ? formats.replace('\s','').split(',') : formats : [];
	const imageAltFormats = requestedFormats.filter(format => supportedFormats.some(item => item.toLowerCase() === format));
	
	const sources = imageAltFormats.map(format => ({
		source: `${src.replace(/\.[\w\d]+/, '')}.${format}`,
		type: `image/${format}`,
		media: null as string | null
	}));
	
	const adaptiveSources = adaptiveModes?.map(item => sources.map(i_src => ({
		media: `(${item.media})`,
		source: item.modifier ? i_src.source.replace(/\..*$/, '') + item.modifier + i_src.source.match(/\..*$/)?.[0] : i_src.source,
		type: i_src.type
	}))).flat(1);
	
	return adaptiveSources?.length ? adaptiveSources : sources || [];
}
