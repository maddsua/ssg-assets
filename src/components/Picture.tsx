import { decideSize } from "./util.js";

interface Props {
	src: string;
	alt: string;
	classlist?: string;
	formats?: string | string[];
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
}

export default ({src, alt, classlist, lazy, sizes, formats, draggable}: Props) => {

	const size = decideSize(sizes);

	return (
		<picture className={classlist}>
			{ ((typeof formats === 'string') ? formats.replace('\s','').split(',') : formats)?.map((format, index) => (
				<source key={`src_${index}`} srcSet={ (src.replace(/\.[\w\d]+/, '.') + format) } type={ `image/${format}` } />
			)) }
			<img src={src} alt={alt} draggable={ draggable === true ? 'true' : 'false' } loading={ lazy !== false ? 'lazy' : undefined } width={size.width} height={size.height} />
		</picture>
	);
}