//	This file is needed to some versions of typescript to f off when modules resolution is eff'd too
//	just ignore it's presense.

import type { ImageProps, PictireProps } from './components/common/setup';

declare let Img: (props: ImageProps) => any;
declare let Picture: (props: PictireProps) => any;

export {
	Img,
	Picture
}
