
import { diffCharacters } from 'https://deno.land/x/diff@v0.3.5/mod.ts';

import { mapSources } from '../components/index.ts';

const objectDiff = (textA: string, textB: string) => {
	let diffResult = '';
	for (const character of diffCharacters(textA, textB)) {
		if (character.wasRemoved) {
			diffResult += `\x1b[31m${character.character}\x1b[0m`;
		} else if (character.wasAdded) {
			diffResult += `\x1b[32m${character.character}\x1b[0m`;
		} else {
			diffResult += `\x1b[37m${character.character}\x1b[0m`;
		}
	}
	return diffResult;
};

const assertEqual = (a: any, b: any) => {

	const textA = JSON.stringify(a, null, '\t');
	const textB = JSON.stringify(b, null, '\t');

	if (textA === textB) return;

	console.error('\r\nAssert arguments did not match\r\n');
	console.error('\r\nExpected:', a, '\r\nHave:', b, '\r\n');
	console.log('Object diff:', objectDiff(textA, textB), '\n\n');

	throw new Error('Assertion failed');
};

const allTests: (() => void)[] = [

	/**
	 * Test 1
	 * Generate source context for:
	 * 	Multiple alt formats
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			formats: ['webp','avif']
		};
	
		const outputSources = mapSources(input.url, input.formats, undefined);
	
		const expectSources = [
			{
				source: '/cats/image.avif',
				type: 'image/avif'
			},
			{
				source: '/cats/image.webp',
				type: 'image/webp'
			}
		];
	
		assertEqual(expectSources, outputSources);
	}),

	/**
	 * Test 2
	 * Generate source context for:
	 * 	Single adaptive mode
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': '(orientation: portrait)',
						'modifier': '.mobile'
					}
				]
			}
		}
	
		const outputSources = mapSources(input.url, undefined, input.adaptive);
	
		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			}
		];
	
		assertEqual(expectSources, outputSources);
	}),

	/**
	 * Test 3
	 * Generate source context for:
	 * 	Single adaptive mode
	 * 	Single image format
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': '(orientation: portrait)',
						'modifier': '.mobile'
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			},
			{
				source: '/cats/image.webp',
				type: 'image/webp'
			}
		];

		assertEqual(expectSources, outputSources);
	}),

	/**
	 * Test 4
	 * Generate source context for:
	 * 	Multiple adaptive mode
	 * 	Multiple image format
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': '(orientation: landscape)',
						'modifier': null
					},
					{
						'media': '(orientation: portrait)',
						'modifier': '.mobile'
					}
				]
			},
			formats: ['webp', 'avif']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: landscape)',
				source: '/cats/image.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: landscape)',
				source: '/cats/image.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			}
		];

		assertEqual(expectSources, outputSources);
	}),

	/**
	 * Test 5
	 * Generate source context for:
	 * 	Single adaptive mode
	 * 	Single image format
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannners/base_name_default_modifier.jpg',
			adaptive: {
				baseModifier: '_default_modifier',
				variants: [
					{
						media: '(orientation: portrait)',
						modifier: '_mobile',
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/bannners/base_name_mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannners/base_name_mobile.jpg',
				type: 'image/jpg'
			},
			{
				source: '/bannners/base_name_default_modifier.webp',
				type: 'image/webp'
			}
		];

		assertEqual(expectSources, outputSources);

	}),

	/**
	 * Test 6
	 * Generate source context for:
	 * 	Multiple adaptive modes
	 * 	Multiple image formats
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannner/id/en_desktop.jpg',
			adaptive: {
				baseModifier: '_desktop',
				variants: [
					{
						media: '(orientation: landscape)',
						modifier: '_desktop',
					},
					{
						media: '(orientation: portrait)',
						modifier: '_mobile',
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources =  [
			{
				media: '(orientation: landscape)',
				source: '/bannner/id/en_desktop.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.jpg',
				type: 'image/jpg'
			}
		];

		assertEqual(expectSources, outputSources);

	}),

	/**
	 * Test 7
	 * Generate source context for:
	 * 	Single adaptive mode
	 * 	Multiple image formats
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannner/id/en_desktop.jpg',
			adaptive: {
				baseModifier: '_desktop',
				variants: [
					{
						media: '(orientation: portrait)',
						modifier: '_mobile',
					}
				]
			},
			formats: ['webp', 'avif']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources =  [
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.jpg',
				type: 'image/jpg'
			},
			{
				media: undefined,
				source: '/bannner/id/en_desktop.avif',
				type: 'image/avif'
			},
			{
				media: undefined,
				source: '/bannner/id/en_desktop.webp',
				type: 'image/webp'
			}
		  ];

		assertEqual(expectSources, outputSources);

	}),

	/**
	 * Test 8
	 * Generate source context for:
	 * 	Multiple adaptive mode
	 * 	Multiple image formats
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannner/id/en_desktop.jpg',
			adaptive: {
				baseModifier: '_desktop',
				variants: [
					{
						media: '(orientation: landscape)',
						modifier: '_desktop',
					},
					{
						media: '(orientation: portrait)',
						modifier: '_mobile',
					},
					{
						media: '(max-width: 720px)',
						modifier: '_tablet',
					}
				]
			},
			formats: ['webp', 'avif']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources =  [
			{
				media: '(orientation: landscape)',
				source: '/bannner/id/en_desktop.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.avif',
				type: 'image/avif'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: landscape)',
				source: '/bannner/id/en_desktop.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.jpg',
				type: 'image/jpg'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.jpg',
				type: 'image/jpg'
			}
		];

		assertEqual(expectSources, outputSources);

	}),

		/**
	 * Test 8
	 * Generate source context for:
	 * 	Multiple adaptive mode
	 * 	Multiple image formats
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannner/id/en_desktop.jpg',
			adaptive: {
				baseModifier: '_desktop',
				variants: [
					{
						media: '(orientation: landscape)',
						modifier: '_desktop',
					},
					{
						media: '(orientation: portrait)',
						modifier: '_mobile',
					},
					{
						media: '(max-width: 720px)',
						modifier: '_tablet',
					}
				]
			},
			formats: ['webp', 'avif']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources =  [
			{
				media: '(orientation: landscape)',
				source: '/bannner/id/en_desktop.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.avif',
				type: 'image/avif'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: landscape)',
				source: '/bannner/id/en_desktop.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/bannner/id/en_mobile.jpg',
				type: 'image/jpg'
			},
			{
				media: '(max-width: 720px)',
				source: '/bannner/id/en_tablet.jpg',
				type: 'image/jpg'
			}
		];

		assertEqual(expectSources, outputSources);

	}),

	/**
	 * Test 9
	 * Generate source context for:
	 * 	Multiple alt formats
	 * Chech that url search params are preserved
	 */
	(() => {

		const input = {
			url: '/cats/image.png?hash=yuefm',
			formats: ['webp','avif']
		};
	
		const outputSources = mapSources(input.url, input.formats, undefined);
	
		const expectSources = [
			{
				source: '/cats/image.avif?hash=yuefm',
				type: 'image/avif'
			},
			{
				source: '/cats/image.webp?hash=yuefm',
				type: 'image/webp'
			}
		];
	
		assertEqual(expectSources, outputSources);
	}),
];

allTests.forEach((testCallback, index) => {
	try {
		testCallback();
		console.log(`✅ Test ${index + 1}`);
	} catch (error) {
		console.error(`❌ Test ${index + 1}:`)
		console.error(error);
		Deno.exit(1);
	}
});
