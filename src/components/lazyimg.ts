
/**
 * Use animation to show image when it's done loading
 */
export const init = (root?: HTMLElement | Element) => {

	const revealAnimationDelay = 500;

	(root || document).querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((lazy) => {
		if (lazy.complete === false) {
			lazy.onload = () => {
				setTimeout(() => {
					lazy.style.opacity = '1';

					setTimeout(() => {
						lazy.style.transition = '';
						lazy.style.opacity = '';
					}, 500);

				}, 100);
			};
			lazy.style.transition = `opacity ${revealAnimationDelay}ms ease`;
			lazy.style.opacity = '0';
		}
	});
};

export default init;
