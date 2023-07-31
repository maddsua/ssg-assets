export type CacheItem = [string, string];

export interface CacheIndex {
	version: number;
	date: number;
	entries: CacheItem[];
};

export interface CacheDiff {
	added: string[];
	removed: string[];
	changed: string[];
	hit: string[];
};

export interface AssetsListItem {
	input: string;
	output: string;
	cache: string;
	slug: string;
};

export interface Config {
	projectConfig: string;
	assetDirConfig?: string;
	verbose: boolean;
	silent: boolean;
	nocache: boolean;
	formats: string[];
	exclude: string[];
	include: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
	quality: Record<string, number>
};
