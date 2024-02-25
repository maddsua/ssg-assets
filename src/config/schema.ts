import { z } from 'zod';
import type { OutputOption } from './formats';

export const configSchema = z.object({
	configFile: z.string().or(z.null()),
	cacheDir: z.string(),
	verbose: z.boolean(),
	formats: z.array(z.string()),
	exclude: z.array(z.string().or(z.instanceof(RegExp))),
	include: z.array(z.string().or(z.instanceof(RegExp))),
	passthrough: z.array(z.string().or(z.instanceof(RegExp))),
	inputDir: z.string(),
	outputDir: z.string(),
	quality: z.record(z.string(), z.number()),
	resetCache: z.boolean(),
	noCache: z.boolean(),
});

export interface ConfigSchema extends z.infer<typeof configSchema> {
	formats: OutputOption[];
};

export interface CliOptionCtx {
	type: 'primitive' | 'array';
	dataType: 'string' | 'number' | 'boolean';
};

//	this is stupid, but it's simpler than trying to get it right with Zod
export const cliOptionsSchema: Partial<Record<keyof ConfigSchema, CliOptionCtx>> = {
	configFile: {
		type: 'primitive',
		dataType: 'string'
	},
	cacheDir: {
		type: 'primitive',
		dataType: 'string'
	},
	inputDir: {
		type: 'primitive',
		dataType: 'string'
	},
	outputDir: {
		type: 'primitive',
		dataType: 'string'
	},
	verbose: {
		type: 'primitive',
		dataType: 'boolean'
	},
	noCache: {
		type: 'primitive',
		dataType: 'boolean'
	},
	resetCache: {
		type: 'primitive',
		dataType: 'boolean'
	},
	formats: {
		type: 'array',
		dataType: 'string'
	},
	exclude: {
		type: 'array',
		dataType: 'string'
	},
	include: {
		type: 'array',
		dataType: 'string'
	},
	passthrough: {
		type: 'array',
		dataType: 'string'
	}
};
