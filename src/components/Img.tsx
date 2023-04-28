import { decideSize } from "./util.js";

interface Props {
	src: string;
	alt: string;
	classlist?: string;
	lazy?: boolean;
	sizes?: number | number[];
}

export default ({src, alt, classlist, lazy, sizes}: Props) => {

	const size = decideSize(sizes);

	return <img className={classlist} alt={alt} width={size.width} height={size.height} src={src} loading={ lazy !== false ? 'lazy' : undefined } draggable="false" />
}