import { ImageProps, getImageSize, classToString } from '../components_shared';

export default (props: ImageProps) => {

	const size = getImageSize(props.sizes);

	return <img className={classToString(props.class)} src={props.src} alt={props.alt} width={size?.width} height={size?.height} draggable={props.draggable} loading={ props.lazy !== false ? 'lazy' : undefined } />
};
