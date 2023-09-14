import { ConfigSchema } from '../src/config/schema';

const config: Partial<ConfigSchema> = {
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
