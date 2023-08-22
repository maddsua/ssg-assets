import Img from "./Img.jsx";
import { PictireProps, mapSources } from '../components_shared';

/**
 * Advanced \<picture\> component
 */
export default ({ src, alt, classlist, lazy, sizes, formats, draggable, adaptiveModes }: PictireProps) => {

	const sources = mapSources(src, formats, adaptiveModes);

	return (
		<picture className={classlist}>
			{ sources.map(item => (
				<source srcset={item.source} type={item.type} media={item.media as string | undefined} />
			)) }
			<Img src={src} alt={alt} draggable={draggable} lazy={lazy} sizes={sizes} />
		</picture>
	);
}
