import packageinfo from '../package.json' assert { type: 'json' };

try {

	const exportedPackages = Object.entries(packageinfo.exports).map(item => ({ submodule: item[0].replace(/^\.?\//, ''), paths: item[1].default || item[1].types })).filter(item => item.paths.includes('component'));

	//	check that d.ts is available for all ui components
	const dtss = Array.from(Deno.readDirSync('../')).filter(item => item.isFile && item.name.endsWith('.d.ts')).map(item => item.name);
	const submodulesWithNoDTS = exportedPackages.filter(submod => !dtss.some(dts => dts === `${submod.submodule}.d.ts`));
	if (submodulesWithNoDTS.length)
		throw new Error(`Submodules do not have a fallback .d.ts declaration: ${submodulesWithNoDTS.map(item => item.submodule).join(', ')}`);
	
	//	check that each ui component directory is added to package.json files field
	const filesToBePacked = packageinfo.files;
	const submodulesNotIncluded = exportedPackages.filter(submod => !filesToBePacked.some(file => file === `components/${submod.submodule}`));
	if (submodulesNotIncluded.length)
		throw new Error(`Submodules is not exported in package.json/files: ${submodulesNotIncluded.map(item => item.submodule).join(', ')}`);

} catch (error) {
	console.error('❌', error.message || error);
	Deno.exit(1);
}

console.log('Inclusion check: All good ✅');
