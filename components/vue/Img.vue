<script setup lang="ts">

import Img from './Img.vue';
import { ImageProps, getImageSize } from '../components_shared';

const { src, alt, classlist, lazy, sizes, draggable } = defineProps<ImageProps>();

const size = getImageSize(sizes);

</script>

<template>

	<img :class="classlist" :src="src" :alt="alt" :width="size?.width" :height="size?.height" :draggable="draggable === true ? 'true' : 'false'" :loading="lazy !== false ? 'lazy' : undefined"  data-maddsua-component="vue:ssgassets:img" />

</template>
