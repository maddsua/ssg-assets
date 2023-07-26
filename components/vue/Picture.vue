<script setup lang="ts">

import Img from './Img.vue';
import { Props, mapSources } from '../config';

const { src, alt, classlist, lazy, sizes, formats, draggable, adaptiveModes } = defineProps<Props>();
const useSources = mapSources(src, formats, adaptiveModes);

</script>

<template>

	<picture :class="classlist" data-maddsua-component="vue:ssgassets:picture">
		<source v-for="item of useSources" :srcset="item.source" :type="item.type" :media="(item.media as string | undefined)" />
		<Img :src="src" :alt="alt" :draggable="draggable" :lazy="lazy" :sizes="sizes" />
	</picture>

</template>
