export type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif';
export type OutputOption = 'original' | OutputFormat;

export type CacheItem = {
	file: string;
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
	hash: string;
	action: 'sharp' | 'copy' | undefined;
};
