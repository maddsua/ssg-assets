import { Config } from '../src/config/schema';

const config: Config = {
	include: [
		'jpg'
	],
	verbose: true,
	inputDir: 'convert/assets',
	outputDir: 'convert/dist',
	exclude: [
		'**/vector/*.svg'
	]
}

export default config;
