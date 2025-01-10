import { type ImageProps, getImageSize, classToString, styleToString, getDOMRoot, hashSrcUrl } from '../index';

export default (props: ImageProps, useDOMRoot?: Document) => {

	const { domRoot, isNativeDOM } = getDOMRoot(useDOMRoot);

	const size = getImageSize(props.sizes);
	const elementClass = classToString(props.class);
	const elementStyle = styleToString(props.style)

	const imgElement = domRoot.createElement('img');
	imgElement.setAttribute('data-ssga-id', 'img:dom');
	elementStyle && imgElement.setAttribute('style', elementStyle);

	//	the diffrence is that for a browser DOM we want to have realtime and *snappy* changes,
	//	while for NodeJS DOM (JSDOM) and other server implementations we'd like a better reflection in generated HTML code
	//	For instance: the "loading" attribute is not being reflected in picture's "innerHTML" when set as img's property (JSDOM)
	if (isNativeDOM) {

		imgElement.src = hashSrcUrl(props.src);
		imgElement.draggable = props.draggable === true;
		imgElement.loading = props.lazy !== false ? 'lazy' : 'eager';

		if (props.alt) {
			imgElement.alt = props.alt;
		}

		if (size) {
			imgElement.width = size.width;
			imgElement.height = size.height;
		}

		if (elementClass) {
			imgElement.className = elementClass;
		}

		return imgElement;

	}

	imgElement.setAttribute('src', hashSrcUrl(props.src));
	imgElement.setAttribute('draggable', props.draggable === true ? 'true' : 'false');
	imgElement.setAttribute('loading', props.lazy !== false ? 'lazy' : 'eager');

	if (props.alt) {
		imgElement.setAttribute('alt', props.alt);
	}

	if (size) {
		imgElement.setAttribute('width', size.width.toString());
		imgElement.setAttribute('height', size.height.toString());
	}

	if (elementClass) {
		imgElement.setAttribute('class', elementClass)
	}

	return imgElement;
};
