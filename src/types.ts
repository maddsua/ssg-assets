export interface CacheItem {
	nameHash: string;
	contentHash: string;
};

export interface CacheIndex {
	version: number;
	date: number;
	entries: CacheItem[];
};

export interface Config {
	config: string;
	hasLocalConfig: boolean;
	verbose: boolean;
	nocache: boolean;
	justCopy: boolean;
	formats: string[];
	exclude: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
};
