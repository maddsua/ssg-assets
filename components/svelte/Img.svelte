<script lang="ts">

	import { type ImageProps, getImageSize, classToString, styleToString, applyImageSrc } from '../index.js';

	export let src: ImageProps['src'];
	export let alt: ImageProps['alt'];
	export let classList: ImageProps['class'] = undefined;
	export let style: ImageProps['style'] = undefined;
	export let lazy: ImageProps['lazy'] = undefined;
	export let sizes: ImageProps['sizes'] = undefined;
	export let draggable: ImageProps['draggable'] = undefined;

	const size = getImageSize(sizes);

</script>

<img src={applyImageSrc(src)}
	alt={alt}
	width={size?.width}
	height={size?.height}
	draggable={ draggable === true ? 'true' : 'false' }
	loading={ lazy !== false ? 'lazy' : undefined }
	class={classToString(classList)}
	style={styleToString(style)}
	data-ssga-id="img:svelte"
/>
