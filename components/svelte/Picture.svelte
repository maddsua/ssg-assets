<script lang="ts">

	import Img from './Img.svelte';
	import { PictireProps, mapSources, classToString, styleToString } from '../index';

	export let src: PictireProps['src'];
	export let alt: PictireProps['alt'];
	export let formats: PictireProps['formats'];
	export let adaptiveMode: PictireProps['adaptiveMode'];
	export let classList: PictireProps['class'];
	export let imgClass: PictireProps['imgClass'];
	export let style: PictireProps['style'];
	export let imgStyle: PictireProps['imgStyle'];
	export let lazy: PictireProps['lazy'];
	export let sizes: PictireProps['sizes'];
	export let draggable: PictireProps['draggable'];

	const sources = mapSources(src, formats, adaptiveMode);

</script>

<picture class={classToString(classList)} style={styleToString(style)} data-ssga-id="picture:svelte">
	
	{#each sources as item}
		<source srcset={item.source} type={item.type} media={item.media} />
	{/each}
	
	<Img src={src} alt={alt} draggable={draggable} lazy={lazy} sizes={sizes} classList={imgClass} style={imgStyle} />

</picture>
