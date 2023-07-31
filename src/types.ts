export interface CacheItem {
	fileName: string;
	contentHash: string;
};

export interface CacheIndex {
	version: number;
	date: number;
	entries: CacheItem[];
};

export interface CacheDiff {
	added: string[];
	removed: string[];
	changed: string[];
};

export interface AssetsListItem {
	input: string;
	output: string;
};

export interface Config {
	projectConfig: string;
	assetDirConfig?: string;
	verbose: boolean;
	nocache: boolean;
	formats: string[];
	exclude: string[];
	include: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
	quality: Record<string, number>
};
