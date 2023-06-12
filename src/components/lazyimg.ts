
/**
 * Use animation to show image when it's done loading
 */
export const init = (root?: HTMLElement | Element) => {

	const revealAnimationDelay = 500;

	(root || document).querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((image) => {

		if (image.complete) return;

		image.style.transition = `opacity ${revealAnimationDelay}ms ease`;
		image.style.opacity = '0';

		image.onload = () => {
			setTimeout(() => {
				image.style.opacity = '1';

				setTimeout(() => {
					image.style.transition = '';
					image.style.opacity = '';
				}, 500);

			}, 100);
		};
	});
};

export default init;
