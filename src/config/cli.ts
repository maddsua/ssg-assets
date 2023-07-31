export interface Argument {
	argName: string[];
	actions: Array< 'get_value' | 'impl_bool' | 'to_string_array' >;
}

export const cliArguments: Record<string, Argument> = {
	projectConfig: {
		argName: ['--config'],
		actions: ['get_value']
	},
	verbose: {
		argName: ['--verbose'],
		actions: ['impl_bool']
	},
	silent: {
		argName: ['--silent', '-s'],
		actions: ['impl_bool']
	},
	nocache: {
		argName: ['--nocache'],
		actions: ['impl_bool']
	},
	formats: {
		argName: ['--formats'],
		actions: ['get_value', 'to_string_array']
	},
	exclude: {
		argName: ['--exclude'],
		actions: ['get_value', 'to_string_array']
	},
	inputDir: {
		argName: ['--inputDir'],
		actions: ['get_value']
	},
	outputDir: {
		argName: ['--outputDir'],
		actions: ['get_value']
	},
};