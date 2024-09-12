
type ArgTransformInput = string | boolean;

interface CliArgsProto {
	config: (value: ArgTransformInput) => string | null;
	verbose: (value: ArgTransformInput) => boolean;
	clearCache: (value: ArgTransformInput) => boolean;
	clearDist: (value: ArgTransformInput) => boolean;
	noCache: (value: ArgTransformInput) => boolean;
	inputDir: (value: ArgTransformInput) => string | null;
	outputDir: (value: ArgTransformInput) => string | null;
};

export type CliArgs = {
	[key in keyof CliArgsProto]: ReturnType<CliArgsProto[key]> | null;
};

const argsProto: CliArgsProto = {
	config: (val) => getStringArg(val),
	verbose: (val) => val !== getBoolArg(val),
	noCache: (val) => val !== getBoolArg(val),
	clearCache: (val) => val !== getBoolArg(val),
	clearDist: (val) => getBoolArg(val),
	inputDir: (val) => getStringArg(val),
	outputDir: (val) => getStringArg(val),
};

const getBoolArg = (val: ArgTransformInput): boolean =>
	val === true || (typeof val === 'string' && val.toLowerCase() === 'true');

const getStringArg = (val: ArgTransformInput): string | null =>
	typeof val === 'string' ? val : null;

export const parseArgs = (args: string[]): CliArgs => {

	const result: Partial<CliArgs> = {};

	for (const key in argsProto) {

		const arg = args.find(item => item.toLowerCase().startsWith(`--${key.toLowerCase()}`));
		if (!arg) {
			result[key as keyof CliArgsProto] = null;
			continue;
		}

		const valStartIdx = arg.indexOf('=');
		const argValue = valStartIdx > 0 ? arg.slice(valStartIdx + 1): true;

		result[key as keyof CliArgsProto] = argsProto[key as keyof CliArgsProto](argValue) as any;
	}

	return result as CliArgs;
};
