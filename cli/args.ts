
type ArgTransformInput = string | boolean;

interface CliArgsProto {
	config: (value: ArgTransformInput) => string | null;
	verbose: (value: ArgTransformInput) => boolean;
	clearCache: (value: ArgTransformInput) => boolean;
}

export type CliArgs = {
	[key in keyof CliArgsProto]: ReturnType<CliArgsProto[key]> | null;
};

const argsProto: CliArgsProto = {
	config: (val) => typeof val === 'string' ? val : null,
	verbose: (val) => val !== 'false',
	clearCache: (val) => val !== 'false',
};

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
