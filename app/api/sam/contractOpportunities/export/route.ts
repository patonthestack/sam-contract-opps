import axios from 'axios';
import { addMonths, formatMMDDYYYY } from '@/lib/utils/helpers';
import {
	JANITORIAL_SERVICES_NAICS_CODE,
	JANITORIAL_SHEET_NAME,
	PARKING_AND_GARAGES_NAICS_CODE,
	PARKING_LOTS_SHEET_NAME,
	SPECIAL_NEEDS_TRANSPO_SHEET_NAME,
	SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE,
	TRANSPORTATION_NAICS_CODE,
	TRANSPORTATION_SHEET_NAME,
} from '@/lib/utils/constants';
import { samResponseToXlsxBuffer } from '@/lib/utils/excelUtils';

export async function GET(req: Request) {
	const auth = req.headers.get('authorization');
	if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	const now = new Date();
	const postedFrom = addMonths(now, -3); //* 3 months ago
	const postedTo = addMonths(now, 3); //* 3 months ahead
	const limit = 100;
	const status = 'active';

	//* Garage NAICS
	const garageNCode = PARKING_AND_GARAGES_NAICS_CODE;

	//* Special Needs Transpo NAICS
	const specialNeedsTranspoNCode = SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE;

	//* Transportation NAICS
	const transpoNCode = TRANSPORTATION_NAICS_CODE;

	//* Janitorial Services NAICS
	const janitorialNCode = JANITORIAL_SERVICES_NAICS_CODE;

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

	const specialNeedsTranspoParams = {
		...commonParams,
		ncode: specialNeedsTranspoNCode,
	};

	const transpoParams = {
		...commonParams,
		ncode: transpoNCode,
	};

	const janitorialParams = {
		...commonParams,
		ncode: janitorialNCode,
	};

	try {
		const [garageRes, specialNeedsTranspoRes, transpoRes, janitorialRes] =
			await Promise.all([
				axios.get(process.env.SAM_API_URL!, {
					params: garageParams,
					headers: {
						Accept: 'application/json',
					},
					timeout: 30_000,
				}),
				axios.get(process.env.SAM_API_URL!, {
					params: specialNeedsTranspoParams,
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
				axios.get(process.env.SAM_API_URL!, {
					params: janitorialParams,
					headers: {
						Accept: 'application/json',
					},
					timeout: 30_000,
				}),
			]);

		const arrayBuffer = await samResponseToXlsxBuffer([
			{
				name: PARKING_LOTS_SHEET_NAME,
				data: garageRes.data.opportunitiesData,
			},
			{
				name: SPECIAL_NEEDS_TRANSPO_SHEET_NAME,
				data: specialNeedsTranspoRes.data.opportunitiesData,
			},
			{
				name: TRANSPORTATION_SHEET_NAME,
				data: transpoRes.data.opportunitiesData,
			},
			{
				name: JANITORIAL_SHEET_NAME,
				data: janitorialRes.data.opportunitiesData,
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
