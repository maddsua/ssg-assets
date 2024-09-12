import { minimatch } from 'minimatch';

export const matchGlobOrRegexp = (pattern: string | RegExp, entry: string) => {

	if (typeof pattern === 'string') {
		return minimatch(entry, pattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true	
		});
	}

	return pattern.test(entry);

};