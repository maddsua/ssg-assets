import { loadAppConfig } from '../../src/config/loader';
import { minimatch } from 'minimatch';
import { ConfigSchema } from '../../src/config/schema';

let appConfig = loadAppConfig();
console.log(appConfig);

if (!appConfig.verbose) throw new Error('"verbose" option was not picked up from config file');

const propsShouldMatch: Partial<ConfigSchema> = {
	inputDir: 'tests/convert/assets',
	outputDir: 'tests/convert/dist',
	cacheDir: 'tests/convert/assets/.cache'
};

for (let item in propsShouldMatch) {
	if (appConfig[item] !== propsShouldMatch[item])
		throw new Error(`Option "${item}" does not match: expected "${propsShouldMatch[item]}, have "${appConfig[item]}"`)
}

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

	return {
		path: filePath,
		pattern: matches.find(item => item.matched)?.pattern
	};

}).filter(item => item.pattern);

const matchPathsExpected = [
	'some/vector/image.svg'
];

console.log({ matchMatrics, matchPathsExpected });

const matchedPatterns = matchMatrics.map(item => item.path);

if (matchedPatterns.some((item, index) => matchPathsExpected[index] !== item))
	throw new Error(`Glob matches are differend`);
