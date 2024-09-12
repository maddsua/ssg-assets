
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

export const normalizePath = (path: string): string => path.replace(/[\\\/]+/g, '/');

interface FormattedTime {
	value: number;
	suffix: string;
};

export const formatTime = (timeMs: number): FormattedTime => {

	if (timeMs < 1_000) {
		return { value: timeMs, suffix: 'ms' };
	}

	if (timeMs < 10_000) {
		return { value: parseFloat((timeMs / 1000).toFixed(1)), suffix: 'seconds' };
	}

	return { value: Math.floor(timeMs / 1000), suffix: 'seconds' };
};
