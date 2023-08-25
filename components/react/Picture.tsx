import Img from "./Img.jsx";
import { PictireProps, mapSources, adaptBaseImageUrl, classToString } from '../components_shared';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps) => {

	const sources = mapSources(props.src, props.formats, props.adaptiveModes);

	return (
		<picture className={classToString(props.class)}>
			{ sources.map(item => (
				<source srcset={item.source} type={item.type} media={item.media as string | undefined} />
			)) }
			<Img src={adaptBaseImageUrl(props.src)} alt={props.alt} draggable={props.draggable} lazy={props.lazy} sizes={props.sizes} />
		</picture>
	);
};
