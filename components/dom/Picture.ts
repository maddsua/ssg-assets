import Img from './Img';
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString, getDOMRoot } from '../common/setup';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps, DOMRoot?: Document) => {

	const root = getDOMRoot(DOMRoot);
	
	const pictureElement = root.createElement('picture');
	pictureElement.setAttribute('data-component-id', 'ssga:picture:dom');
	
	const classString = classToString(props.class);
	classString && (pictureElement.className = classString);
	
	const styleString = styleToString(props.style);
	styleString && pictureElement.setAttribute('style', styleString);

	mapSources(props.src, props.formats, props.adaptiveModes).forEach(source => {
		const sourceElement = root.createElement('source');
		sourceElement.srcset = source.source;
		sourceElement.type = source.type;
		source.media ? sourceElement.media = source.media : undefined;
		pictureElement.appendChild(sourceElement);
	})
	
	const imgComponent = Img({
		src: adaptBaseImageUrl(props.src, props.adaptiveModes),
		alt: props.alt,
		draggable: props.draggable,
		lazy: props.lazy,
		sizes: props.sizes,
		class: props.imgClass,
		style: props.imgStyle
	}, DOMRoot);

	pictureElement.appendChild(imgComponent);

	return pictureElement;
};
