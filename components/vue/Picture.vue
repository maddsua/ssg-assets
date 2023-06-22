<script setup lang="ts">

import Img from './Img.vue';

interface Props {
	src: string;
	alt: string;
	classlist?: string;
	formats?: string | string[];
	draggable?: boolean;
	lazy?: boolean;
	sizes?: number | number[];
}
const { src, alt, classlist, lazy, sizes, formats, draggable } = defineProps<Props>();

const sourcesList = formats ? (typeof formats === 'string') ? formats.replace('\s','').split(',') : formats : [];

</script>

<template>

	<picture :class="classlist" data-maddsua-component="vue:ssgassets:picture">
		<source v-for="format of sourcesList" :srcset="src.replace(/\.[\w\d]+/, '.') + format" :type="`image/${format}`" />
		<Img :src="src" :alt="alt" :draggable="draggable" :lazy="lazy" :sizes="sizes" />
	</picture>

</template>
