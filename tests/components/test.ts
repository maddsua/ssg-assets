//	This test should be run with Deno
//	I'm to lazy to adapt this nonsence for nodeJS
//
//	This is not an automated test, it's used to verify image source generation,
//	but that is not needed to be tested on each build

import { mapSources, adaptBaseImageUrl } from '../../components/index.ts';

const assertEqual = (a: any, b: any) => {
	if (a === b) return;
	console.error('\r\nAssert arguments did not match:', '\r\nArgument A:', a, '\r\nArgument B:', b, '\r\n');
	throw new Error('Assertion failed');
};


/**
 * Test 1
 * Generate source context and transform image src for:
 * 	Single adaptive mode
 */
(() => {

	const input = {
		url: '/cats/1.png',
		adaptive: [
			{
				'media': 'orientation: portrait',
				'modifier': '.mobile'
			}
		]
	}

	const outputSources = mapSources(input.url, undefined, input.adaptive);
	const outputImageSrc = adaptBaseImageUrl(input.url, input.adaptive);

	assertEqual(outputSources, null)

	console.log(outputSources);
	console.log(outputImageSrc);

})();


/**
 * Test 2
 * Generate source context and transform image src for:
 * 	Single adaptive mode
 * 	Single image format
 */
(() => {

	const input = {
		url: '/cats/2.png',
		adaptive: [
			{
				'media': 'orientation: portrait',
				'modifier': '.mobile'
			}
		],
		formats: ['webp']
	}

	const outputSources = mapSources(input.url, input.formats, input.adaptive);
	const outputImageSrc = adaptBaseImageUrl(input.url, input.adaptive);

	console.log(outputSources);
	console.log(outputImageSrc);

})();


/*



const testData: Array<{
	url: string;
	adaptive: AdaptiveMode[];
	formats: ImageFormats[];
}> = [
	{
		url: '/cats/1.png',
		adaptive: [
			{
				'media': 'orientation: portrait',
				'modifier': '.mobile'
			}
		],
		formats: ['webp', 'avif']
	},
	{
		url: '/whatever/main.jpg',
		adaptive: [
			{
				'media': 'orientation: landscape',
				'modifier': null
			},
			{
				'media': 'orientation: portrait',
				'modifier': '.mobile'
			}
		],
		formats: ['webp', 'avif']
	},
	{
		url: '/assets/banners/141022/uk_desktop.jpg',
		adaptive: [
			{
				media: 'orientation: landscape',
				modifier: '_desktop'
			},
			{
				media: 'orientation: portrait',
				modifier: '_mobile'
			}
		],
		formats: ['webp', 'avif']
	}
];

const results = testData.map(item => ({
	sources: mapSources(item.url, item.formats, item.adaptive).map(item => ({ media: item.media, source: item.source })),
	img: adaptBaseImageUrl(item.url, item.adaptive),
}));

console.log(results);
*/