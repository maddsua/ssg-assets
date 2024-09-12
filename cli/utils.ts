
export const splitChunks = <T>(items: T[], size: number): T[][] => {

	if (size < 1) {
		return [items];
	}

	const result: T[][] = [];

	for (let i = 0; i < items.length; i += size) {
		result.push(items.slice(i, i + size));
	}

	return result;
};
