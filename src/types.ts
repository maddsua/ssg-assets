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
	formats: string[];
	exclude: string[];
	include: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
	quality: Record<string, number>
};
