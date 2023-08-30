import { ImageProps, getImageSize, classToString, styleToString, getDOMRoot } from '../common/setup';

export default (props: ImageProps, useDOMRoot?: Document) => {

	const { domRoot, isNativeDOM } = getDOMRoot(useDOMRoot);

	const size = getImageSize(props.sizes);
	const elementClass = classToString(props.class);
	const elementStyle = styleToString(props.style)

	const imgElement = domRoot.createElement('img');
	imgElement.setAttribute('data-component-id', 'ssga:img:dom');
	elementStyle && imgElement.setAttribute('style', elementStyle);

	//	the diffrence is that for a browser DOM we want to have realtime ant *snappy* changes,
	//	where for NodeJS DOM (JSDOM) and such implementations a better html reflection is more desirable
	//	For instance: the "loading" attribute is not being reflected when setting it as image's property (JSDOM)
	if (isNativeDOM) {

		imgElement.src = props.src;
		imgElement.alt = props.alt;
		imgElement.draggable = props.draggable === true;
		imgElement.loading = props.lazy !== false ? 'lazy' : 'eager';
		size?.width && (imgElement.width = size.width);
		size?.height && (imgElement.height = size.height);
		elementClass && (imgElement.className = elementClass);

	} else {

		imgElement.setAttribute('src', props.src);
		imgElement.setAttribute('alt', props.alt);
		imgElement.setAttribute('draggable', props.draggable === true ? 'true' : 'false');
		imgElement.setAttribute('loading', props.lazy !== false ? 'lazy' : 'eager');
		size?.width && (imgElement.setAttribute('width', size.width.toString()));
		size?.height && (imgElement.setAttribute('height', size.height.toString()));
		elementClass && (imgElement.setAttribute('class', elementClass));
	}

	return imgElement;
};
