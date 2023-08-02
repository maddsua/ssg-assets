import { outputFormats } from "./config/defaults";

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
	action: 'sharp' | 'copy'
};

export interface Config {
	config: string;
	assetConfig?: string;
	cacheDir: string;
	verbose: boolean;
	silent: boolean;
	noCache: boolean;
	formats: OutputOption[];
	exclude: string[];
	include: string[];
	inputDir: string;
	outputDir: string;
	quality: Record<string, number>
};

interface ConfigTypeSchema {
	type: string;
	mutable?: boolean;
	mutable_cli?: boolean;
	mutable_project?: boolean;
	mutable_assets?: boolean;
	subtype?: string;
	stringSeparator?: string;
	of?: string | object;
	equals?: any[];
};

const configTypes: Record<keyof Config, ConfigTypeSchema> = {
	config: {
		type: 'string'
	},
	assetConfig: {
		type: 'string',
		mutable: false
	},
	cacheDir: {
		type: 'string',
		mutable: false,
	},
	verbose: {
		type: 'boolean',
		mutable_project: true
	},
	noCache: {
		type: 'boolean',
		mutable_project: true,
		mutable_assets: true
	},
	silent: {
		type: 'boolean',
		mutable_project: true,
		mutable_assets: true
	},
	formats: {
		type: 'object',
		mutable_project: true,
		mutable_assets: true,
		subtype: 'array',
		stringSeparator: ',',
		of: 'string',
		equals: outputFormats
	},
	exclude: {
		type: 'object',
		mutable_project: true,
		mutable_assets: true,
		subtype: 'array',
		of: 'string',
	},
	include: {
		type: 'object',
		mutable_project: true,
		mutable_assets: true,
		subtype: 'array',
		of: 'string',
	},
	inputDir: {
		type: 'string',
		mutable_project: true,
	},
	outputDir: {
		type: 'string',
		mutable_project: true,
	},
	quality: {
		type: 'object',
		mutable_project: true,
		mutable_assets: true,
		of: {
			type: 'number',
			from: 10,
			to: 100
		}
	}
};
export const ConfigSchema = configTypes as Record<string, ConfigTypeSchema>;
