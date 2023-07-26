import Img from "./Img.jsx";
import { Props, mapSources } from '../components_shared';

/**
 * Advanced \<picture\> component
 */
export default ({ src, alt, classlist, lazy, sizes, formats, draggable, adaptiveModes }: Props) => {

	const useSources = mapSources(src, formats, adaptiveModes);

	return (
		<picture className={classlist}>
			{ useSources.map(item => (
				<source srcset={item.source} type={item.type} media={item.media as string | undefined} />
			)) }
			<Img src={src} alt={alt} draggable={draggable} lazy={lazy} sizes={sizes} />
		</picture>
	);
}
