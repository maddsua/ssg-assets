<script setup lang="ts">

import Img from './Img.vue';
import { ImageProps, getImageSize } from '../components_shared';

const props = defineProps<ImageProps>();

const size = getImageSize(props.sizes);

</script>

<template>

	<img :class="props.class" :src="props.src" :alt="props.alt" :width="size?.width" :height="size?.height" :draggable="props.draggable === true ? 'true' : 'false'" :loading="props.lazy !== false ? 'lazy' : undefined"  data-maddsua-component="vue:ssgassets:img" />

</template>
