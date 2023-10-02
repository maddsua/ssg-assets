import { z } from 'zod';
import { OutputOption } from './formats';

export const configSchema = z.object({
	configFile: z.string().or(z.null()),
	cacheDir: z.string(),
	verbose: z.boolean(),
	formats: z.array(z.string()),
	exclude: z.array(z.string()),
	include: z.array(z.string()),
	passthrough: z.array(z.string()),
	inputDir: z.string(),
	outputDir: z.string(),
	quality: z.record(z.string(), z.number()),
	resetCache: z.boolean(),
	noCache: z.boolean(),
});

export interface ConfigSchema extends z.infer<typeof configSchema> {
	formats: OutputOption[];
};
