import { loadAppConfig } from '../../src/config/loader';
import { minimatch } from 'minimatch';

let appConfig = loadAppConfig();
console.log(appConfig);


const globExpressions = appConfig.exclude;
const pathsToMatch = [
	'some/vector/image.svg',
	'some/ui/image.svg',
	'some/cats/cute.jpg',
	'places/paris/thatCODpicture.webp'
];

const matchMatrics = pathsToMatch.map(filePath => {
	const matches = globExpressions.map(pattern => ({
		pattern,
		matched: minimatch(filePath, pattern, {
			matchBase: true,
			nobrace: true,
			noext: true,
			nocase: true
		})
	}));

	return matches.filter(item => item.matched).map(item1 => ({
		path: filePath,
		pattern: item1.pattern
	}));

}).filter(item => item.length);

console.log(matchMatrics);
