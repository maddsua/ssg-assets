import type { Config } from '../index';

const config: Config = {
	verbose: true,
	inputDir: 'convert/assets',
	outputDir: 'convert/dist',
	exclude: [
		'**/vector/*.svg'
	]
}

export default config;
