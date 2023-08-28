import Picture from './components/dom/Picture';
import Img from './components/dom/Img';

declare const enableLazyLoad: (root?: HTMLElement | Element) => void;

export {
	Picture,
	Img,
	enableLazyLoad
}
