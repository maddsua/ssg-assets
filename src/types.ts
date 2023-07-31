export interface CacheItem {
	nameHash: string;
	contentHash: string;
};

export interface CacheIndex {
	version: number;
	date: number;
	entries: CacheItem[];
};

export type ImageFormats = 'original' | 'avif' | 'webp';

export interface Config {
	verbose: boolean;
	nocache: boolean;
	justCopy: boolean;
	formats: ImageFormats[];
	exclude: string[];
};
