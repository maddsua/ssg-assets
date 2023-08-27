import Picture from './Picture';
import Img from './Img';
import lazyload from '../common/lazyload';

const enableLazyLoad = (root?: HTMLElement | Element) => lazyload(root, 'ssga:img:react');

export {
	Picture,
	Img,
	enableLazyLoad
};
