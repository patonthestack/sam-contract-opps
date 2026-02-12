import axios from 'axios';
import { addMonths, formatMMDDYYYY } from '@/lib/utils/helpers';
import {
	PARKING_AND_GARAGES_NAICS_CODE,
	SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE,
} from '@/lib/utils/constants';
import { samResponseToXlsxBuffer } from '@/lib/utils/excelUtils';
import { sendReportEmail } from '@/lib/utils/emailUtils';
import { SamReportEmail } from '@/lib/email/templates/SamReportEmail';

const PARKING_LOTS_SHEET_NAME = 'Parking Lots and Garages';
const SPECIAL_NEEDS_TRANSPO_SHEET_NAME = 'Special Needs Transportation';

export async function GET() {
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

		const workbook = await samResponseToXlsxBuffer([
			{
				name: PARKING_LOTS_SHEET_NAME,
				data: garageRes.data.opportunitiesData,
			},
			{
				name: SPECIAL_NEEDS_TRANSPO_SHEET_NAME,
				data: transpoRes.data.opportunitiesData,
			},
		]);

		//* Return as file download
		const filename = `sam-contract-opportunities-${new Date().toISOString().slice(0, 10)}.xlsx`;

		const emailRes = await sendReportEmail({
			subject: `SAM Daily Report (${now.toISOString().slice(0, 10)})`,
			filename,
			attachment: workbook,
			react: SamReportEmail({
				reportDate: now.toISOString().slice(0, 10),
				companyName: 'Tepnology LLC',
				logoUrl: `${process.env.PUBLIC_BASE_URL}/tepnology-icon-70-70_myversion.png`,
				sheetSummaries: [
					{
						name: PARKING_LOTS_SHEET_NAME,
						count: garageRes.data.opportunitiesData.length,
					},
					{
						name: SPECIAL_NEEDS_TRANSPO_SHEET_NAME,
						count: transpoRes.data.opportunitiesData.length,
					},
				],
			}),
		});

		if (emailRes.error) {
			return Response.json(
				{
					ok: false,
					error: emailRes.error,
				},
				{
					status: emailRes.error.statusCode ?? 500,
				},
			);
		}

		return Response.json({
			ok: true,
			filename,
			garageSheet: garageRes.data.opportunitiesData.length,
			transpoSheet: transpoRes.data.opportunitiesData.length,
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
