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

interface TransformFlags {
	srcNotModified: boolean;
};

export const transformAsset = async (props: TransformAssetProps): Promise<AssetTransformResult[]> => {

	const { asset, cacheIndex, cfg } = props;

	const result: AssetTransformResult[] = [];

	const flags: TransformFlags = {
		srcNotModified: false,
	};

	const formatKeys = Object.keys(cfg.outputFormats) as OutputFormat[];
	const keys = 'original' in cfg.outputFormats ?
		(['original', ...formatKeys.filter(format => format !== 'original')]) : formatKeys;

	for (const key of keys) {

		const format = key as OutputFormat;
		const output = cfg.outputFormats[format];
		if (!output) {
			throw new Error(`Output option for key "${format}" is not defined`);
		}

		const destSlug = format === 'original' ? asset.slug : replaceExt(asset.slug, format);
		const destPath = join(cfg.outputDir, destSlug);

		createDestDir(destPath);

		const transformProps: TransformImageProps = {
			src: asset.path,
			dest: destPath,
			format,
			options: output,
			preserveDist: !cfg.clearDist,
			cache: !cfg.noCache ? {
				dir: cfg.cacheDir,
				index: cacheIndex,
				srcHash: await hashFile(asset.path),
			} : null,
			flags,
		};

		const transformResult = await transformImage(transformProps);

		if (format === 'original' && transformResult.status === TransformStatus.NotModified) {
			flags.srcNotModified = true;
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
	preserveDist: boolean;
	cache: TransformCacheOption | null;
	flags: TransformFlags;
};

interface TransformCacheOption {
	dir: string;
	index: CacheIndex;
	srcHash: string;
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

	if (props.preserveDist && !await isModified(props.src, props.dest)) {
		return { status: TransformStatus.NotModified };
	}

	if (props.format === 'original') {
		copyFileSync(props.src, props.dest);
		return { status: TransformStatus.Transferred };
	}

	let cacheKey: string | null = null;

	if (props.cache) {

		cacheKey = `${props.cache.srcHash}.${props.format}`;
		const cacheEntry = props.cache.index.get(cacheKey);
	
		if (cacheEntry) {

			copyFileSync(cacheEntry.resolved, props.dest);
			props.cache.index.delete(cacheKey);

			const status = props.flags.srcNotModified ?
				TransformStatus.NotModified : TransformStatus.CacheHit;

			return { status };
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
