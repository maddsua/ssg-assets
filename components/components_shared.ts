import { Prop } from "vue";

export interface AdaptiveMode {
	media: string;
	modifier: string | null | undefined;
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
	
	const adaptiveSources = adaptiveModes?.map(i_media => sources.map(i_src => ({
		media: `(${i_media.media})`,
		source: i_media.modifier ? i_src.source.replace(/\..*$/, '') + i_media.modifier + i_src.source.match(/\..*$/)?.[0] : i_src.source,
		type: i_src.type
	}))).flat(1);
	
	return adaptiveSources?.length ? adaptiveSources : sources || [];
}
