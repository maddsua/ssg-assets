import Img from './Img';
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString, composeAttributesHTML } from '../common/setup';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps, DOMRoot?: Document) => {

	const root = typeof document === 'object' ? document : DOMRoot;
	if (!root) throw new EvalError('document global object is not accessible in this runtime and you did not provide an alternative DOM root');

	
	const pictureElement = root.createElement('picture');
	
	pictureElement.setAttribute('data-component-id', 'ssga:picture:dom');
	
	pictureElement.className = classToString(props.class) || '';
	
	const styleString = styleToString(props.style)
	styleString ? pictureElement.setAttribute('style', styleString) : undefined;

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
