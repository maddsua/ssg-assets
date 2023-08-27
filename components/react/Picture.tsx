import Img from "./Img.jsx";
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString } from '../common/setup';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps) => {

	const sources = mapSources(props.src, props.formats, props.adaptiveModes);

	return (
		<picture className={classToString(props.class)} style={styleToString(props.style)}>
			{ sources.map(item => (
				<source srcset={item.source} type={item.type} media={item.media as string | undefined} />
			)) }
			<Img src={adaptBaseImageUrl(props.src, props.adaptiveModes)} alt={props.alt} draggable={props.draggable} lazy={props.lazy} sizes={props.sizes} class={props.imgClass} style={props.imgStyle} />
		</picture>
	);
};
