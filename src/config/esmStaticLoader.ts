import { ConfigSchema } from './schema';

export const getConfigDefaultExport = (moduleContent: string): Partial<ConfigSchema> => {

	//	remove tab indentation bc this way it's easier to read in console
	let prepdContents = moduleContent.replace(/\t/g, '  ');
	
	//	remove imports
	prepdContents = prepdContents.replace(/import [^\n]+\n+/ig, '');
	//	remove "as" notation
	prepdContents = prepdContents.replace(/\s*as\s*[\w\d]+[ \t]*[\;\n]?/ig, '');
	//	remove colon notation
	prepdContents = prepdContents.replace(/:\s*[^=]+\s*=\s*/ig, ' = ');
	//	replace default export with return statement
	prepdContents = prepdContents.replace(/export\sdefault\s/ig, 'return ');
	
	//console.log(prepdContents);
	
	const configFunction = new Function(prepdContents);
	console.log(configFunction());

	return configFunction();
};
