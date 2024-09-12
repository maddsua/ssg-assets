
type ArgTransformInput = string | boolean;

interface CliArgsProto {
	config: (value: ArgTransformInput) => string | null;
	verbose: (value: ArgTransformInput) => boolean;
	clearCache: (value: ArgTransformInput) => boolean;
	clearDist: (value: ArgTransformInput) => boolean;
	noCache: (value: ArgTransformInput) => boolean;
	inputDir: (value: ArgTransformInput) => string | null;
	outputDir: (value: ArgTransformInput) => string | null;
	concurrency: (value: ArgTransformInput) => number | null;
};

export type CliArgs = {
	[key in keyof CliArgsProto]: ReturnType<CliArgsProto[key]> | null;
};

const argsProto: CliArgsProto = {
	config: (val) => getStringArg(val),
	verbose: (val) => getBoolArg(val),
	noCache: (val) => getBoolArg(val),
	clearCache: (val) => getBoolArg(val),
	clearDist: (val) => getBoolArg(val),
	inputDir: (val) => getStringArg(val),
	outputDir: (val) => getStringArg(val),
	concurrency: (val) => getNumberArg(val),
};

const getBoolArg = (val: ArgTransformInput): boolean =>
	val === true || (typeof val === 'string' && val.toLowerCase() === 'true');

const getStringArg = (val: ArgTransformInput): string | null =>
	typeof val === 'string' ? val : null;

const getNumberArg = (val: ArgTransformInput): number | null => {

	if (typeof val !== 'string') {
		return null;
	}

	const numeric = parseFloat(val);
	if (isNaN(numeric) || !isFinite(numeric)) {
		return null;
	}

	return numeric;
};

export const parseArgs = (args: string[]): CliArgs => {

	const result: Partial<CliArgs> = {};
	const argSet = new Set(args.filter(item => item.startsWith('--')));

	for (const key in argsProto) {

		const arg = args.find(item => item.toLowerCase().startsWith(`--${key.toLowerCase()}`));
		if (!arg) {
			result[key as keyof CliArgsProto] = null;
			continue;
		}

		argSet.delete(arg);

		const valStartIdx = arg.indexOf('=');
		const argValue = valStartIdx > 0 ? arg.slice(valStartIdx + 1): true;

		result[key as keyof CliArgsProto] = argsProto[key as keyof CliArgsProto](argValue) as any;
	}

	if (argSet.size) {
		throw new Error(`Unrecognized CLI arguments: ${Array.from(argSet.keys()).join('; ')}`);
	}

	return result as CliArgs;
};
