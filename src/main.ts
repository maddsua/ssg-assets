#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

import sharp from 'sharp';
import chalk from 'chalk';
import { globSync } from 'glob';
import { minimatch } from 'minimatch';

import { loadConfig } from './config/loader';
import resolveSources from './content/loader';

const config = loadConfig();

if (config.verbose) {
	console.log('Verbose mode enabled. The tool is extra talkative now.');
	console.log('Current config:', config);
}

const sources = resolveSources(config.inputDir, config.include, config.exclude);

console.log(sources);