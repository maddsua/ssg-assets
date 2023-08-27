import { asyncSleep } from './timeouts';

export default () => {

	document.querySelectorAll<HTMLImageElement>('img[loading="lazy"][data-maddsua-component]').forEach(image => {

		if (image.complete) return;

		image.style.transition = `opacity 500ms ease`;
		image.style.opacity = '0';

		image.onload = async () => {

			await asyncSleep(10);
			image.style.opacity = '1';

			await asyncSleep(500);
			image.style.transition = '';
			image.style.opacity = '';
		};
	});
};
