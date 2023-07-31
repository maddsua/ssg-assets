#!/usr/bin/env node

import path from "path";
import fs from 'fs';
import { createHash } from "crypto";

import sharp from 'sharp';
import chalk from 'chalk';
import { globSync } from 'glob';
import { minimatch } from 'minimatch';
