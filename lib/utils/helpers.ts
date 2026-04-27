import fs from 'fs';

export function addMonths(base: Date, months: number): Date {
	const d = new Date(base);
	d.setMonth(d.getMonth() + months);
	return d;
}

export function formatMMDDYYYY(date: Date): string {
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const yyyy = date.getFullYear();

	return `${mm}/${dd}/${yyyy}`;
}

const CACHE_FILE = './cache.json';

export function loadCache() {
	if (!fs.existsSync(CACHE_FILE)) return { seenIds: [] };
	return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
}

export function saveCache(cache: any) {
	fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}
