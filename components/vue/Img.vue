<script setup lang="ts">

import { type ImageProps, getImageSize, styleToString } from '../index';

const props = defineProps<ImageProps>();
const size = getImageSize(props.sizes);

</script>

<template>

	<img :src="props.src" :alt="props.alt" :width="size?.width" :height="size?.height" :draggable="props.draggable === true" :loading="props.lazy !== false ? 'lazy' : undefined" :class="props.class" :style="styleToString(props.style)" data-ssga-id="img:vue" />

</template>
