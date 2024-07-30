
Deno.test('npm package integrity', async () => {

	const packageinfo = (await import('../package.json', {
		assert: { type: 'json' }
	})).default;

	//	check that all ui component submodules are exported and accessible
	const componentSubmodules = Array.from(Deno.readDirSync(Deno.cwd().endsWith('tests') ? '../components' : './components'))
		.filter(item => item.isDirectory).map(item => item.name);

	const submoduleExportRecords = componentSubmodules.map(item => ({
		name: item,
		record: packageinfo.exports[`./${item}` as keyof typeof packageinfo.exports]
	}));

	//	package exports
	const uiComponentsNotExported = submoduleExportRecords.filter(item => !item.record).map(item => item.name);
	if (uiComponentsNotExported.length) {
		throw new Error(`Submodules not exported from package.json: ${uiComponentsNotExported.join(', ')}`);
	}

	//	package default export
	const noDefaultExport = submoduleExportRecords
		.filter(item => item.record.default !== `./components/${item.name}/index.ts`)
		.map(item => item.name);

	if (noDefaultExport.length) {
		throw new Error(`Submodules do not have default export option in package.json: ${noDefaultExport.join(', ')}`);
	}

	//	package types export
	const noTypesExport = submoduleExportRecords
		.filter(item => item.record.types !== `./components/${item.name}/index.ts`).
		map(item => item.name);

	if (noTypesExport.length) {
		throw new Error(`Submodules do not have types export option in package.json: ${noTypesExport.join(', ')}`);
	}

	//	check that d.ts is available for all ui components
	const dtsFilesList = Array.from(Deno.readDirSync(Deno.cwd().endsWith('tests') ? '../' : './'))
		.filter(item => item.isFile && item.name.endsWith('.d.ts'))
		.map(item => item.name);
	
	const dtsSet = new Set<string>(dtsFilesList);

	const submodulesWithNoDTS = componentSubmodules.filter(submod => !dtsSet.has(`${submod}.d.ts`));
	if (submodulesWithNoDTS.length) {
		throw new Error(`Submodules do not have a fallback .d.ts declaration: ${submodulesWithNoDTS.map(item => item).join(', ')}`);
	}
	
	//	check that each ui component directory is added to package.json files field
	const filesToBePacked = new Set<string>(packageinfo.files);
	const submodulesNotIncluded = componentSubmodules.filter(submod => !filesToBePacked.has(`components/${submod}`));

	if (submodulesNotIncluded.length) {
		throw new Error(`Submodules is not exported in package.json/files: ${submodulesNotIncluded.map(item => item).join(', ')}`);
	}
});
