import { ImageProps, getImageSize, classToString, styleToString, attributeListToString } from '../common/setup';

export default (props: ImageProps) => {

	const size = getImageSize(props.sizes);

	const attrList: [string, any][] = [
		['src', props.src],
		['alt', props.alt],
		['width', size?.width],
		['height', size?.width],
		['draggable', props.draggable],
		['loading', props.lazy !== false ? 'lazy' : undefined],
		['class', classToString(props.class)],
		['style', styleToString(props.style)]
	];

	return `<img ${attributeListToString(attrList)}/>`;
};
