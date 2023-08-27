//	This test should be run with Deno
//	I'm to lazy to adapt this nonsence for nodeJS
//
//	This is not an automated test, it's used to verify image source generation,
//	but that is not needed to be tested on each build

import { mapSources, adaptBaseImageUrl, AdaptiveMode, ImageFormats } from '../../../components/common/setup.ts';

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
