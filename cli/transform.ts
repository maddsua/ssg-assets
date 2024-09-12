import { hashFile, isModified, type AssetEntry, createDestDir, type CacheIndex } from "./assets";
import type { OutputConfig, RuntimeConfig } from "./config";
import type { OutputFormat } from "./formats";

import { copyFileSync } from "fs";
import { join } from "path";

import sharp from 'sharp';

export interface TransformAssetProps {
	asset: AssetEntry;
	cacheIndex: CacheIndex;
	cfg: RuntimeConfig;
};

export interface AssetTransformResult extends TransformResult {
	asset: AssetEntry;
	format: OutputFormat;
	output: TransformedAsset;
};

export interface TransformedAsset {
	path: string;
	slug: string;
};

export const transformAsset = async (props: TransformAssetProps): Promise<AssetTransformResult[]> => {

	const { asset, cacheIndex, cfg } = props;

	const result: AssetTransformResult[] = [];

	const flags = {
		notModified: false,
	};

	for (const key in cfg.outputFormats) {

		const format = key as OutputFormat;

		const output = cfg.outputFormats[format];
		if (!output) {
			throw new Error(`Output option for key "${key}" is not defined`);
		}

		const destSlug = format === 'original' ? asset.slug : replaceExt(asset.slug, format);
		const destPath = join(cfg.outputDir, destSlug);

		createDestDir(destPath);

		const transformProps: TransformImageProps = {
			src: asset.path,
			dest: destPath,
			format: format,
			cache: !cfg.noCache ? {
				dir: cfg.cacheDir,
				index: cacheIndex,
			} : null,
			options: output,
		};

		const transformResult = !flags.notModified ? await transformImage(transformProps) : nullTransform();

		if (format === 'original' && transformResult.status === TransformStatus.NotModified) {
			flags.notModified = true
		}

		result.push(Object.assign({
			asset: asset,
			format: format,
			output: {
				path: destPath,
				slug: destSlug,
			},
		}, transformResult));
	}

	return result;
};

const replaceExt = (filepath: string, newExt: string): string => {

	const lastSlashIdx = filepath.lastIndexOf('/');
	const lastDotIdx = filepath.lastIndexOf('.');

	if (lastDotIdx < 0 || lastSlashIdx > lastDotIdx) {
		return `${filepath}.${newExt}`;
	}

	return `${filepath.slice(0, lastDotIdx)}.${newExt}`;
};

interface TransformImageProps {
	src: string;
	dest: string;
	format: OutputFormat;
	options: OutputConfig;
	cache: TransformCacheOption | null;
};

interface TransformCacheOption {
	dir: string;
	index: CacheIndex;
};

export interface TransformResult {
	status: TransformStatus;
};

export enum TransformStatus {
	NotModified,
	Transferred,
	CacheHit,
	Transformed,
};

const transformImage = async (props: TransformImageProps): Promise<TransformResult> => {

	if (!await isModified(props.src, props.dest)) {
		return { status: TransformStatus.NotModified };
	}

	if (props.format === 'original') {
		copyFileSync(props.src, props.dest);
		return { status: TransformStatus.Transferred };
	}

	let cacheKey: string | null = null;

	if (props.cache) {

		cacheKey = `${await hashFile(props.src)}.${props.format}`;
		const cacheEntry = props.cache.index.get(cacheKey);
	
		if (cacheEntry) {
			copyFileSync(cacheEntry.resolved, props.dest);
			return { status: TransformStatus.CacheHit };
		}
	}

	await sharp(props.src)
		.toFormat(props.format, { quality: props.options.quality })
		.toFile(props.dest);

	if (cacheKey) {
		copyFileSync(props.dest, join(props.cache!.dir, cacheKey));
	}

	return { status: TransformStatus.Transformed };
};

const nullTransform = (): TransformResult => ({ status: TransformStatus.NotModified });
