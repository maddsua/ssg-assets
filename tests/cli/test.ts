import { loadAppConfig } from '../../src/config/loader';

import { resolveAssets } from '../../src/content/loader';

let appConfig = await loadAppConfig();
console.log(appConfig);

const assets = await resolveAssets(appConfig);
console.log(assets);

if (!appConfig.verbose) throw new Error('"verbose" option was not picked up from config file');

const matchAssetAction = [
	{
		slug: 'images/azamat-esmurziyev-qhdGyb-jw2M-unsplash.jpg',
		action: 'sharp'
	},
	{
		slug: 'vector/bg.svg',
		action: undefined
	},
	{
		slug: 'ui/button.svg',
		action: 'copy'
	}
];

matchAssetAction.forEach(item => {
	const asset = assets.find(asset => asset.slug === item.slug);
	if (asset?.action !== item.action) throw new Error(`Asset "${item.slug}" action expected to be "${item.action}" but is "${asset?.action}" instead`);
});
