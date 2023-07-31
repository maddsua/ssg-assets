export type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif';
export type OutputOption = 'original' | OutputFormat;

export type CacheItem = {
	slugHash: string;
	content: string;
	formats: OutputFormat[];
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
	hit: string[];
};

export interface AssetsListItem {
	source: string;
	dest: string;
	cache: string;
	slug: string;
	slugHash: string;
	action: 'convert' | 'copy'
};

export interface Config {
	projectConfig: string;
	assetDirConfig?: string;
	verbose: boolean;
	silent: boolean;
	nocache: boolean;
	formats: OutputOption[];
	exclude: string[];
	include: string[];
	inputDir: string | undefined;
	outputDir: string | undefined;
	quality: Record<string, number>
};
