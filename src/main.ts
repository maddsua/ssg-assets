#!/usr/bin/env node

import { loadConfig } from "./config/loader";

const config = loadConfig();

console.log(config);

import path from "path";
import fs from 'fs';
import { createHash } from "crypto";

import sharp from 'sharp';
import chalk from 'chalk';
import { globSync } from 'glob';
import { minimatch } from 'minimatch';
