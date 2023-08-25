//	This test should be run with Deno
//	I'm to lazy to adapt this nonsence for nodeJS

import { mapSources, adaptBaseImageUrl, AdaptiveMode, ImageFormatsType } from '../../../components/components_shared.ts';

const testData: Array<{
	url: string;
	adaptive: AdaptiveMode[];
	formats: ImageFormatsType;
}> = [
	{
		url: '/cats/1.png',
		adaptive: [],
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
		url: '/banners/1248.jpg',
		adaptive: [],
		formats: ['webp', 'avif']
	}
]

const results = testData.map(item => ({
	img: adaptBaseImageUrl(item.url, item.adaptive),
	sources: mapSources(item.url, item.formats, item.adaptive)
}));

console.log(results);
