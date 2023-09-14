import Img from './Img';
import { type PictireProps, mapSources, classToString, styleToString, getDOMRoot } from '../index';

export default (props: PictireProps, useDOMRoot?: Document) => {

	const { domRoot, isNativeDOM } = getDOMRoot(useDOMRoot);
	
	const classString = classToString(props.class);
	const styleString = styleToString(props.style);

	const pictureElement = domRoot.createElement('picture');
	pictureElement.setAttribute('data-ssga-id', 'picture:dom');
	styleString && pictureElement.setAttribute('style', styleString);

	if (isNativeDOM) {
		classString && (pictureElement.className = classString);
	} else {
		classString && pictureElement.setAttribute('class', classString);
	}
	
	mapSources(props.src, props.formats, props.adaptiveMode).forEach(source => {
		const sourceElement = domRoot.createElement('source');
		sourceElement.srcset = source.source;
		sourceElement.type = source.type;
		source.media ? sourceElement.media = source.media : undefined;
		pictureElement.appendChild(sourceElement);
	});
	
	const imgComponent = Img({
		src: props.src,
		alt: props.alt,
		draggable: props.draggable,
		lazy: props.lazy,
		sizes: props.sizes,
		class: props.imgClass,
		style: props.imgStyle
	}, useDOMRoot);

	pictureElement.appendChild(imgComponent);

	return pictureElement;
};
