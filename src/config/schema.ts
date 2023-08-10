import { outputFormats } from "./defaults";
import { OutputOption } from "../content/types";

export interface Config {
	config: string;
	assetConfig: string;
	cacheDir: string;
	verbose: boolean;
	silent: boolean;
	resetCache: boolean;
	noCache: boolean;
	formats: OutputOption[];
	exclude: string[];
	include: string[];
	passtrough: string[];
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
	resetCache: {
		type: 'boolean',
		mutable_project: false,
		mutable_assets: false
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
	passtrough: {
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