import axios from 'axios';
import { addMonths, formatMMDDYYYY } from '@/lib/utils/helpers';
import {
	PARKING_AND_GARAGES_NAICS_CODE,
	SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE,
} from '@/lib/utils/constants';
import { samResponseToXlsxBuffer } from '@/lib/utils/excelUtils';

export async function GET(req: Request) {
	const auth = req.headers.get('authorization');
	if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	const now = new Date();
	const postedFrom = addMonths(now, -1); //* 1 month ago
	const postedTo = addMonths(now, 6); //* 6 months ahead
	const limit = 100;
	const status = 'active';

	//* Garage params
	const garageNCode = PARKING_AND_GARAGES_NAICS_CODE;

	//* Special Needs Transpo params
	const transpoNCode = SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE;

	const commonParams = {
		api_key: process.env.SAM_API_KEY!,
		postedFrom: formatMMDDYYYY(postedFrom),
		postedTo: formatMMDDYYYY(postedTo),
		status,
		limit,
	};

	const garageParams = {
		...commonParams,
		ncode: garageNCode,
	};

	const transpoParams = {
		...commonParams,
		ncode: transpoNCode,
	};

	try {
		const [garageRes, transpoRes] = await Promise.all([
			axios.get(process.env.SAM_API_URL!, {
				params: garageParams,
				headers: {
					Accept: 'application/json',
				},
				timeout: 30_000,
			}),
			axios.get(process.env.SAM_API_URL!, {
				params: transpoParams,
				headers: {
					Accept: 'application/json',
				},
				timeout: 30_000,
			}),
		]);

		const arrayBuffer = await samResponseToXlsxBuffer([
			{
				name: 'Parking Lots and Garages',
				data: garageRes.data.opportunitiesData,
			},
			{
				name: 'Special Needs Transportation',
				data: transpoRes.data.opportunitiesData,
			},
		]);

		//* Return as file download
		const filename = `sam-contract-opportunities-${new Date().toISOString().slice(0, 10)}.xlsx`;

		return new Response(arrayBuffer, {
			status: 200,
			headers: {
				'Content-Type':
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Cache-Control': 'no-store',
			},
		});
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			//* Axios error (HTTP error, timeout, network issue)
			console.error('Axios Error', {
				message: err.message,
				status: err.response?.status,
				data: err.response?.data,
			});

			return Response.json(
				{ error: 'Upstream SAM API failed' },
				{ status: err.response?.status ?? 502 },
			);
		}

		//* Non-axios error (programming bug, runtime issue)
		console.error('Unknown Error', err);

		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
