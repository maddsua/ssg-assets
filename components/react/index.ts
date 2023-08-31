import Picture from './Picture';
import Img from './Img';
import { revealLazyLoaded} from '../index';

const enableLazyLoad = (root?: HTMLElement | Element) => revealLazyLoaded(root, 'ssga:img:react');

export {
	Picture,
	Img,
	enableLazyLoad
};
