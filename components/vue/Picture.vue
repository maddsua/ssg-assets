<script setup lang="ts">

import Img from './Img.vue';
import { PictireProps, mapSources, adaptBaseImageUrl } from '../components_shared';

const props = defineProps<PictireProps>();

</script>

<template>

	<picture :class="props.classlist" data-maddsua-component="vue:ssgassets:picture">
		<source v-for="item of mapSources(props.src, props.formats, props.adaptiveModes)" :srcset="item.source" :type="item.type" :media="(item.media as string | undefined)" />
		<Img :src="adaptBaseImageUrl(props.src)" :alt="props.alt" :draggable="props.draggable" :lazy="props.lazy" :sizes="props.sizes" />
	</picture>

</template>
