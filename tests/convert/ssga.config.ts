import type { Config } from '../../index';

const config: Config = {
	verbose: true,
	inputDir: './assets',
	outputDir: './dist',
	exclude: [
		'**/vector/*.svg'
	]
}

export default config;
