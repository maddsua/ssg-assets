const asyncSleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));

export default (root?: HTMLElement | Element | null, componentID?: string) => {

	const lazyImages = (root || document).querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
	const attachToImages = componentID ? Array.from(lazyImages).filter(item => item.getAttribute('data-component-id') === componentID) : lazyImages;


	attachToImages.forEach(image => {

		if (image.complete) return;

		image.style.opacity = '0';
		
		image.onload = async () => {
			
			image.style.transition = `opacity 500ms ease`;
			await asyncSleep(100);
			image.style.opacity = '1';
			
			await asyncSleep(500);
			image.style.transition = '';
			image.style.opacity = '';
		};
	});
};
