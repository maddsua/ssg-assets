<script setup lang="ts">

import Img from './Img.vue';
import { type PictireProps, mapSources, styleToString } from '../index';

const props = defineProps<PictireProps>();

</script>

<template>

	<picture :class="props.class" :style="styleToString(props.style)" data-ssga-id="picture:vue">
		<source v-for="item of mapSources(props.src, props.formats, props.adaptiveMode)" :srcset="item.source" :type="item.type" :media="(item.media as string | undefined)" />
		<Img :src="props.src" :alt="props.alt" :draggable="props.draggable" :lazy="props.lazy" :sizes="props.sizes" :class="props.imgClass" :style="props.imgStyle" />
	</picture>

</template>
