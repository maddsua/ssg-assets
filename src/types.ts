import type { ImageFormat } from './formats';

export type CacheItem = {
	file: string;
	content: string;
	formats: ImageFormat[];
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
