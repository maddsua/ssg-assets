import type { OutputFormat } from "./formats";

export interface OutputConfig {
	quality: number;
};

export type OutputOptions = Record<OutputFormat, OutputConfig>;
export type OutputOptionsConfig = Partial<OutputOptions>;

export type FilterFunction = (filename: string) => boolean;

export type SkipPattern = string | RegExp;

export interface Config {
	verbose?: boolean;
	noCache?: boolean;
	clearDist?: boolean;
	outputFormats?: OutputFormat[] | OutputOptionsConfig;
	inputDir?: string;
	outputDir?: string;
	cacheDir?: string;
	skip?: SkipPattern[] | null;
	filter?: FilterFunction | null;
	concurrency?: number;
};

export interface RuntimeConfig extends Required<Config> {
	configFile: string | null;
	outputFormats: OutputOptionsConfig;
};
