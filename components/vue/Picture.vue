<script setup lang="ts">

import Img from './Img.vue';
import { PictireProps, mapSources, adaptBaseImageUrl, styleToString } from '../common/setup';

const props = defineProps<PictireProps>();

</script>

<template>

	<picture :class="props.class" :style="styleToString(props.style)" data-component-id="ssga:picture:vue">
		<source v-for="item of mapSources(props.src, props.formats, props.adaptiveModes)" :srcset="item.source" :type="item.type" :media="(item.media as string | undefined)" />
		<Img :src="adaptBaseImageUrl(props.src, props.adaptiveModes)" :alt="props.alt" :draggable="props.draggable" :lazy="props.lazy" :sizes="props.sizes" :class="props.imgClass" :style="props.imgStyle" />
	</picture>

</template>
