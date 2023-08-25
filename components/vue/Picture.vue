<script setup lang="ts">

import Img from './Img.vue';
import { PictireProps, mapSources, adaptBaseImageUrl } from '../components_shared';

const { src, alt, classlist, lazy, sizes, formats, draggable, adaptiveModes } = defineProps<PictireProps>();

</script>

<template>

	<picture :class="classlist" data-maddsua-component="vue:ssgassets:picture">
		<source v-for="item of mapSources(src, formats, adaptiveModes)" :srcset="item.source" :type="item.type" :media="(item.media as string | undefined)" />
		<Img :src="adaptBaseImageUrl(src)" :alt="alt" :draggable="draggable" :lazy="lazy" :sizes="sizes" />
	</picture>

</template>
