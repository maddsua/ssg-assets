import fs from 'fs';
import { createHash } from 'crypto';

export const getFileHashSha256 = async (filepath: string, verbose?: boolean): Promise<string> => new Promise(async (resolve, reject) => {

	try {

		if (!fs.existsSync(filepath))
			throw new Error(`File does not exsist: ${filepath}`);

		const readStream = fs.createReadStream(filepath);
		const hashCtx = createHash('sha256');

		readStream.on('error', () => reject(`Error hashing file: ${filepath}`));

		readStream.on('data', (chunk) => hashCtx.update(chunk));
		readStream.on('end', () => resolve(hashCtx.digest('hex')));

	} catch (error) {
		reject(`Error hashing file: ${filepath}`);
	}
});
