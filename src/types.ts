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
	projectConfig: string;
	assetDirConfig?: string;
	verbose: boolean;
	nocache: boolean;
	justCopy: boolean;
	formats: string[];
	exclude: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
	quality: Record<string, number>
};
