import { ImageProps, getImageSize } from '../components_shared';

export default ({src, alt, classlist, lazy, sizes, draggable}: ImageProps) => {

	const size = getImageSize(sizes);

	return <img className={classlist} src={src} alt={alt} width={size?.width} height={size?.height} draggable={draggable} loading={ lazy !== false ? 'lazy' : undefined } />
};
