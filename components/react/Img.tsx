import { ImageProps, getImageSize, classToString, styleToString } from '../index';

export default (props: ImageProps) => {

	const size = getImageSize(props.sizes);

	return <img src={props.src} alt={props.alt} width={size?.width} height={size?.height} draggable={props.draggable === true} loading={ props.lazy !== false ? 'lazy' : undefined } className={classToString(props.class)} style={styleToString(props.style)} data-ssga-id="img:react" />
};
