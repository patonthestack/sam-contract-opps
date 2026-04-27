import axios from 'axios';
import { fetchSamOpportunitySheets } from '@/lib/sam/fetchContractOpportunities';

export async function GET() {
	try {
		const sheets = await fetchSamOpportunitySheets();
		const totalOpportunities = sheets.reduce(
			(total, sheet) => total + sheet.data.length,
			0,
		);

		return Response.json(
			{
				ok: true,
				totalOpportunities,
				sheets,
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
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

		console.error('Unknown Error', err);

		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
