import { ConfigSchema } from './schema';

import process from 'process';
import chalk from 'chalk';

export const importArguments = () => {

	const configEntries: Record<string, any> = {};

	const argDirectives = process.argv.slice(2).filter(item => /^\-\-[\d\w\_\-]+(=[\d\w\_\-\,\.\*\\\/]+)?$/.test(item));

	const directivesCaseless = new Map<string, string>(Object.keys(ConfigSchema).map(item => [item.toLowerCase(), item]));

	argDirectives.forEach(arg => {

		const [ key, value ] = arg.slice(2).split('=');

		const option = directivesCaseless.get(key.toLowerCase());
		if (!option) {
			console.warn(chalk.yellow(`⚠  Unknown option '${key}'`), '(cli)');
			return;
		}

		const optionType = ConfigSchema[option];
		let valueTemp: any = value;

		try {

			switch (optionType.type) {
	
				case 'object': {
					
					if (optionType?.subtype === 'array') {
	
						if (optionType?.stringSeparator)
							valueTemp = valueTemp.split(optionType.stringSeparator);

						if (optionType?.of) {

							if (typeof optionType.of === 'string') {
								if (!(valueTemp as any[]).some(item => typeof item != optionType.of))
									throw new Error('Option type mismatch');
							}
						}
	
						if (optionType?.equals) {
							const matches = (valueTemp as any[])?.map(item => optionType?.equals?.map((item1: any) => item1 === item)).flat();
							if (!matches.some(item => item)) throw new Error('Option value mismatch');
						}
					}
	
				} break;

				case 'boolean': {
					valueTemp = !(value === 'false');
				} break;

				case 'string': {
					if (typeof value != 'string' || !value?.length)
						throw new Error('Empty string option');
					valueTemp = value;
				} break;
			
				default: throw new Error('Unsupported option');
			}

		} catch (error) {
			console.warn(chalk.yellow(`⚠  ${error} on '${key}'`), '(cli)');
			return;
		}

		configEntries[option] = valueTemp;
	});

	return configEntries;
}
