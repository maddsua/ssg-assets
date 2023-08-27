import Img from './Img';
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString } from '../components_shared';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps) => {

	const sources = mapSources(props.src, props.formats, props.adaptiveModes).map(source => `<source srcset="${source.source}" type="image/${source.type}" media="${source.media}" />`) || [];
	
	return (`
		<picture>
			${sources.join('\n')}
			${Img({
				src: adaptBaseImageUrl(props.src, props.adaptiveModes),
				alt: props.alt,
				draggable: props.draggable,
				lazy: props.lazy,
				sizes: props.sizes,
				class: props.imgClass,
				style: props.imgStyle
			})}
		</picture>
	`).replace(/[\s]{2,}/g, '');
};
