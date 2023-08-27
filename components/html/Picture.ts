import Img from './Img';
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString, attributeListToString } from '../common/setup';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps) => {

	const sources = mapSources(props.src, props.formats, props.adaptiveModes).map(source => `<source srcset="${source.source}" type="image/${source.type}" media="${source.media}" />`) || [];

	const attrList: [string, any][] = [
		['class', classToString(props.class)],
		['style', styleToString(props.style)]
	];

	console.log(attributeListToString(attrList))

	return (`
		<picture ${attributeListToString(attrList)}>
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
