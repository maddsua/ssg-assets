import { ImageProps, getImageSize, classToString, styleToString } from '../common/setup';

export default (props: ImageProps, DOMRoot?: Document) => {

	const root = typeof document === 'object' ? document : DOMRoot;
	if (!root) throw new EvalError('document global object is not accessible in this runtime and you did not provide an alternative DOM root');

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
