<script setup lang="ts">

import Img from './Img.vue';

/**
 * Supported image formats are: avif, webp, png, jpg
 */

interface AdaptiveMode {
	media: string;
	modifier: string;
}

interface Props {
	src: string;
	alt: string;
	classlist?: string;
	formats?: string | string[];
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
	adaptiveModes?: AdaptiveMode[];
}
const { src, alt, classlist, lazy, sizes, formats, draggable, adaptiveModes } = defineProps<Props>();

const supportedFormats = [ 'avif', 'webp', 'png', 'jpg' ];
const requestedFormats = formats ? (typeof formats === 'string') ? formats.replace('\s','').split(',') : formats : [];
const imageAltFormats = supportedFormats.filter(format => requestedFormats.some(item => item.toLowerCase() === format));

const sources = imageAltFormats.map(format => ({
	source: `${src.replace(/\.[\w\d]+/, '')}.${format}`,
	type: `image/${format}`,
	media: null
}));

const adaptiveSources = adaptiveModes.map(sourceMedia => sources.map(sourceFormats => {
	const { source } = sourceFormats;
	sourceFormats.media = sourceMedia.media;
	sourceFormats.source = source.replace(/\..*$/, '') + sourceMedia.modifier + source.match(/\..*$/)?.[0];
	return sourceFormats;
})).flat(2);

const useSources = adaptiveSources.length ? adaptiveSources : sources;

</script>

<template>

	<picture :class="classlist" data-maddsua-component="vue:ssgassets:picture">
		<source v-for="item of useSources" :srcset="item.source" :type="item.type" />
		<Img :src="src" :alt="alt" :draggable="draggable" :lazy="lazy" :sizes="sizes" />
	</picture>

</template>
