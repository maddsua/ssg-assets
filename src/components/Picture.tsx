import Img from "./Img.jsx";

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

	return (
		<picture className={classlist}>
			{ ((typeof formats === 'string') ? formats.replace('\s','').split(',') : formats)?.map((format, index) => (
				<source key={`src_${index}`} srcSet={ (src.replace(/\.[\w\d]+/, '.') + format) } type={ `image/${format}` } />
			)) }
			<Img src={src} alt={alt} draggable={draggable} lazy={lazy} sizes={sizes} />
		</picture>
	);
}