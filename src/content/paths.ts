import { existsSync, statSync } from 'fs';

/**
 * Replace all backslashes, remove repeating and trailing slash
 */
export const normalizePath = (filepath: string) => filepath.replace(/[\\\/]+/g, '/').replace(/\/$/, '');

export const fix_relative_glob = (pattern: string) => {

	if (/\*\.[\d\w]+$/.test(pattern)) {

		return '**/' + pattern.slice(pattern.lastIndexOf('*'));

	} else if (!pattern.includes('*')) {

		try {
			if (!existsSync(pattern)) return pattern;
			if (!statSync(pattern).isDirectory()) return pattern;
		} catch (_error) {
			return pattern;
		}
	
		return pattern + ( pattern.endsWith('/') ? '*': '/*');
	}

	return pattern;
};
