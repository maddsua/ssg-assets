import { SvelteComponent } from 'svelte';

import { ImageProps, PictireProps, revealLazyLoaded } from './components/index';

declare class Img extends SvelteComponent<ImageProps, {}, {}> {}
declare class Picture extends SvelteComponent<PictireProps, {}, {}> {}

export {
	Img,
	Picture,
	revealLazyLoaded
}
