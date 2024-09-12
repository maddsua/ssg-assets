import type { Config } from '../../index';

const config: Config = {
	verbose: true,
	inputDir: './assets',
	outputDir: './dist',
	skip: [
		'**/vector/*.svg'
	]
}

export default config;
