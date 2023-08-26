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

interface AssetListBaseItem {
	source: string;
	dest: string;
	cache: string;
	slug: string;
	hash: string;
};

interface AssetListSharpItem extends AssetListBaseItem {
	format: ImageFormat;
	action: 'sharp';
};

interface AssetListCopyItem extends AssetListBaseItem {
	action: 'copy';
};

interface AssetListNoActionItem extends AssetListBaseItem {
	action: null | undefined;
};

export type AssetsListItem = AssetListSharpItem | AssetListCopyItem | AssetListNoActionItem;
