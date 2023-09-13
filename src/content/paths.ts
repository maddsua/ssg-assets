/**
 * Replace all backslashes, remove repeating and trailing slash
 */
export const normalizePath = (filepath: string) => filepath.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
