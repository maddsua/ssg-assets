//	This file is needed to some versions of typescript to f off when modules resolution is eff'd too
//	just ignore it's presense.

import { ImageProps, PictireProps, revealLazyLoaded } from './components/index';

declare const Img: (props: ImageProps) => any;
declare const Picture: (props: PictireProps) => any;

export {
	Img,
	Picture,
	revealLazyLoaded
}
