import { ImageProps } from "../components_shared";

interface i_sizes {
	width: number | undefined,
	height: number | undefined
}

export const decideSize = (sizes: number | number[] | undefined): i_sizes => {

	if (!sizes) return { width: undefined, height: undefined }

	if (typeof sizes === 'number') sizes = [sizes];

	return {
		//	@ts-ignore
		width: sizes?.length >= 1 ? sizes[0] : undefined,
		//	@ts-ignore
		height: sizes?.length >= 2 ? sizes[1] : (sizes?.length == 1 ? sizes[0] : undefined)
	}
};

export default ({src, alt, classlist, lazy, sizes, draggable}: ImageProps) => {

	const size = decideSize(sizes);

	return <img className={classlist} src={src} alt={alt} width={size.width} height={size.height} draggable={draggable} loading={ lazy !== false ? 'lazy' : undefined } />
};
