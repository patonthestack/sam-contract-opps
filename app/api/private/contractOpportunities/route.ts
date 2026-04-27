import { loadCache, saveCache } from '@/lib/utils/helpers';
import axios from 'axios';
import * as cheerio from 'cheerio';

const KEYWORDS = [
	'parking',
	'valet',
	'garage',
	'transportation',
	'shuttle',
	'lot',
];

function isRelevant(opp: { title: string }) {
	return KEYWORDS.some((k) => opp.title.toLowerCase().includes(k));
}

async function scrapeBonfire(url: string, source: string) {
	const { data } = await axios.get(url);
	const $ = cheerio.load(data);

	const results: {
		id: string; // fallback ID
		title: string;
		source: string;
	}[] = [];

	$('.opportunity, .listing').each((_, el) => {
		const title = $(el).text();

		if (!title) return;

		results.push({
			id: title, // fallback ID
			title,
			source,
		});
	});

	return results;
}

async function scrapePWC() {
	const { data } = await axios.get(
		process.env.PRINCE_WILLIAM_COUNTY_API_URL as string,
	);

	// OpenGov is React-based → no simple HTML parsing
	// You’ll need API call or fallback strategy (see below)

	return data;
}

async function run() {
	const cache = loadCache();

	const sources = [
		{
			name: 'fairfax',
			fn: () =>
				scrapeBonfire(process.env.FAIRFAX_COUNTY_API_URL as string, 'fairfax'),
		},
		// {
		// 	name: 'pwc',
		// 	fn: () => scrapePWC(),
		// },
	];

	let all = [];

	for (const s of sources) {
		const data = await s.fn();
		all.push(...data);
	}

	const newOnes = all.filter((o) => !cache.seenIds.includes(o.id));
	console.log('newones', newOnes);
	const relevant = newOnes.filter(isRelevant);

	if (relevant.length) {
		console.log('🔥 NEW LEADS:', relevant);
		// sendEmail(relevant)
	}

	cache.seenIds.push(...newOnes.map((o) => o.id));
	saveCache(cache);
}

export async function GET(req: Request) {
	const auth = req.headers.get('authorization');
	if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	try {
		await run();
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			//* Axios error (HTTP error, timeout, network issue)
			console.error('Axios Error', {
				message: err.message,
				status: err.response?.status,
				data: err.response?.data,
			});

			return Response.json(
				{ error: 'Upstream API failed' },
				{ status: err.response?.status ?? 502 },
			);
		}

		//* Non-axios error (programming bug, runtime issue)
		console.error('Unknown Error', err);

		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
