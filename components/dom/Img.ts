import { ImageProps, getImageSize, classToString, styleToString, getDOMRoot } from '../common/setup';

export default (props: ImageProps, DOMRoot?: Document) => {

	const root = getDOMRoot(DOMRoot);

	const size = getImageSize(props.sizes);

	const imgElement = root.createElement('img');
	imgElement.setAttribute('data-component-id', 'ssga:img:dom');

	imgElement.src = props.src;
	imgElement.alt = props.alt;
	imgElement.draggable = props.draggable === true;

	imgElement.loading = props.lazy !== false ? 'lazy' : 'eager';
	//	redundancy for JSDOM, idk what's wrong
	imgElement.setAttribute('loading', props.lazy !== false ? 'lazy' : 'eager');

	size?.width && (imgElement.width = size.width);
	size?.height && (imgElement.height = size.height);

	const classString = classToString(props.class);
	classString && (imgElement.className = classString);

	const styleString = styleToString(props.style)
	styleString && imgElement.setAttribute('style', styleString);

	return imgElement;
};
