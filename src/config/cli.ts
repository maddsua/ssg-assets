export interface Argument {
	pfx: string[];
	actions: Array< 'get_value' | 'impl_bool' | 'to_string_array' >;
}

export const cliArguments: Record<string, Argument> = {
	config: {
		pfx: ['--config'],
		actions: ['get_value']
	},
	verbose: {
		pfx: ['--verbose'],
		actions: ['impl_bool']
	},
	nocache: {
		pfx: ['--nocache'],
		actions: ['impl_bool']
	},
	justCopy: {
		pfx: ['--copy'],
		actions: ['impl_bool']
	},
	formats: {
		pfx: ['--formats'],
		actions: ['get_value', 'to_string_array']
	},
	exclude: {
		pfx: ['--exclude'],
		actions: ['get_value', 'to_string_array']
	},
	inputDir: {
		pfx: ['--input'],
		actions: ['get_value']
	},
	outputDir: {
		pfx: ['--output'],
		actions: ['get_value']
	},
};