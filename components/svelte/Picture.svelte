<script lang="ts">

	import Img from './Img.svelte';
	import { type PictireProps, mapSources, classToString, styleToString } from '../index';

	export let src: PictireProps['src'];
	export let alt: PictireProps['alt'];
	export let formats: PictireProps['formats'] = undefined;
	export let adaptiveMode: PictireProps['adaptiveMode'] = undefined;
	export let classList: PictireProps['class'] = undefined;
	export let imgClass: PictireProps['imgClass'] = undefined;
	export let style: PictireProps['style'] = undefined;
	export let imgStyle: PictireProps['imgStyle'] = undefined;
	export let lazy: PictireProps['lazy'] = undefined;
	export let sizes: PictireProps['sizes'] = undefined;
	export let draggable: PictireProps['draggable'] = undefined;

	const sources = mapSources(src, formats, adaptiveMode);

</script>

<picture class={classToString(classList)} style={styleToString(style)} data-ssga-id="picture:svelte">
	
	{#each sources as item}
		<source srcset={item.source} type={item.type} media={item.media} />
	{/each}
	
	<Img src={src} alt={alt} draggable={draggable} lazy={lazy} sizes={sizes} classList={imgClass} style={imgStyle} />

</picture>
