import { readFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

import { ConfigSchema } from '../types';

export const loadConfigFile = (filePath: string) => {

	const configEntries: Record<string, any> = {};

	try {
		const configFileContents = readFileSync(path.join(process.cwd(), filePath));
		const importedConfig = JSON.parse(configFileContents.toString());

		for (let key in importedConfig) {

			try {

				const schema = ConfigSchema[key];
				if (!schema) throw new Error('is unknown');
	
				if (typeof importedConfig[key] != schema.type) {
					throw new Error('type invalid');
				}

				configEntries[key] = importedConfig[key];

			} catch (error) {
				console.warn(chalk.yellow(`⚠  Key '${key}' ${error}`), `(${filePath})`);
				continue;
			}
		}

	} catch (_error) {
		return {};
	}

	return configEntries;
}
