<script setup lang="ts">

import Img from './Img.vue';
import { ImageProps, getImageSize, styleToString } from '../components_shared';

const props = defineProps<ImageProps>();
const size = getImageSize(props.sizes);

</script>

<template>

	<img :src="props.src" :alt="props.alt" :width="size?.width" :height="size?.height" :draggable="props.draggable === true ? 'true' : 'false'" :loading="props.lazy !== false ? 'lazy' : undefined" :class="props.class" :style="styleToString(props.style)" data-maddsua-component="vue:ssgassets:img" />

</template>
