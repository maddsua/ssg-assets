//@ts-nocheck
import Img from './Img.vue';
import Picture from './Picture.vue';
import lazyload from '../common/lazyload';

const enableLazyLoad = (root?: HTMLElement | Element) => lazyload(root, 'ssga:img:vue');

export {
	Img,
	Picture,
	enableLazyLoad
};
