<script lang="ts">

	import { ImageProps, getImageSize, classToString, styleToString } from '../index';

	export let src: ImageProps['src'];
	export let alt: ImageProps['alt'];
	export let classList: ImageProps['class'];
	export let style: ImageProps['style'];
	export let lazy: ImageProps['lazy'];
	export let sizes: ImageProps['sizes'];
	export let draggable: ImageProps['draggable'];

	const size = getImageSize(sizes);

</script>

<img src={src} alt={alt} width={size?.width} height={size?.height} draggable={ draggable === true ? 'true' : 'false' } loading={ lazy !== false ? 'lazy' : undefined } class={classToString(classList)} style={styleToString(style)} data-ssga-id="img:svelte" />
