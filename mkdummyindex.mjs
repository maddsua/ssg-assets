import fs from 'fs';
import path from 'path';

const packagejson = JSON.parse(fs.readFileSync('./package.json'));

const dummytext = fs.readFileSync('./src/dummy.ts');

const findFields = [
	'main',
	'types'
];

const createDummyFor = findFields.map(item => packagejson[item]).filter(item => !!item);

createDummyFor.forEach(item => {
	let destdir = path.dirname(item);
	if (!fs.existsSync(destdir)) fs.mkdirSync(destdir, { recursive: true });
	fs.writeFileSync(item, dummytext);
});

console.log('Dummy index files written ok,', dummytext.length, 'bytes');
