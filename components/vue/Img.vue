<script setup lang="ts">

import Img from './Img.vue';
import type { ImageProps } from '../components_shared';

const { src, alt, classlist, lazy, sizes, draggable } = defineProps<ImageProps>();

const size = sizes ? (typeof sizes === 'number' ? ({
	width: sizes,
	height: sizes
}) : ({
	width: sizes[0],
	height: sizes?.length >= 2 ? sizes[1] : sizes[0]
})) : ({
	width: undefined,
	height: undefined
});

</script>

<template>

	<img :class="classlist" :src="src" :alt="alt" :width="size.width" :height="size.height" :draggable="draggable === true ? 'true' : 'false'" :loading="lazy !== false ? 'lazy' : undefined"  data-maddsua-component="vue:ssgassets:img" />

</template>
