import { Prop } from "vue";

export interface AdaptiveMode {
	media: string;
	modifier: string;
}

export interface Props {
	src: string;
	alt: string;
	classlist?: string;
	formats?: string | string[];
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
	adaptiveModes?: AdaptiveMode[];
}

export const supportedFormats = [ 'avif', 'webp', 'png', 'jpg' ];

export const mapSources = (src: Props['src'], formats: Props['formats'], adaptiveModes: Props['adaptiveModes']) => {

	const requestedFormats = formats ? (typeof formats === 'string') ? formats.replace('\s','').split(',') : formats : [];
	const imageAltFormats = supportedFormats.filter(format => requestedFormats.some(item => item.toLowerCase() === format));
	
	const sources = imageAltFormats.map(format => ({
		source: `${src.replace(/\.[\w\d]+/, '')}.${format}`,
		type: `image/${format}`,
		media: null as string | null
	}));
	
	const adaptiveSources = adaptiveModes?.map(sourceMedia => sources.map(sourceFormats => {
		const { source } = sourceFormats;
		sourceFormats.media = `(${sourceMedia.media})`;
		sourceFormats.source = source.replace(/\..*$/, '') + sourceMedia.modifier + source.match(/\..*$/)?.[0];
		return sourceFormats;
	})).flat(2);
	
	return adaptiveSources?.length ? adaptiveSources : sources;
}
