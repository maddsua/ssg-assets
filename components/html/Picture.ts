import Img from './Img';
import { PictireProps, mapSources, classToString, styleToString, composeAttributesHTML } from '../index';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps) => {

	const sources = mapSources(props.src, props.formats, props.adaptiveMode).map(source => `<source srcset="${source.source}" type="image/${source.type}" media="${source.media}" />`) || [];

	const attrList = {
		class: classToString(props.class),
		style: styleToString(props.style),
	};

	const imgComponent = Img({
		src: props.src,
		alt: props.alt,
		draggable: props.draggable,
		lazy: props.lazy,
		sizes: props.sizes,
		class: props.imgClass,
		style: props.imgStyle
	});

	return (`
		<picture ${composeAttributesHTML(attrList)} data-component-id="ssga:picture:html" >
			${sources.join('\n')}
			${imgComponent}
		</picture>
	`).replace(/\t+/g, ' ');
};
