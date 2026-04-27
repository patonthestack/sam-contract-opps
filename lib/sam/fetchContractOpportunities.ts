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
import type { OpportunitiesData, SamSearchResponse } from '@/types/sam/v2';

export type SamOpportunitySheet = {
	name: string;
	data: OpportunitiesData;
};

type SamFetchConfig = {
	name: string;
	ncode: number;
};

const SAM_FETCH_CONFIGS: SamFetchConfig[] = [
	{
		name: PARKING_LOTS_SHEET_NAME,
		ncode: PARKING_AND_GARAGES_NAICS_CODE,
	},
	{
		name: SPECIAL_NEEDS_TRANSPO_SHEET_NAME,
		ncode: SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE,
	},
	{
		name: TRANSPORTATION_SHEET_NAME,
		ncode: TRANSPORTATION_NAICS_CODE,
	},
	{
		name: JANITORIAL_SHEET_NAME,
		ncode: JANITORIAL_SERVICES_NAICS_CODE,
	},
];

export async function fetchSamOpportunitySheets(): Promise<SamOpportunitySheet[]> {
	const now = new Date();
	const postedFrom = addMonths(now, -3);
	const postedTo = addMonths(now, 3);
	const limit = 100;
	const status = 'active';

	const commonParams = {
		api_key: process.env.SAM_API_KEY!,
		postedFrom: formatMMDDYYYY(postedFrom),
		postedTo: formatMMDDYYYY(postedTo),
		status,
		limit,
	};

	const responses = await Promise.all(
		SAM_FETCH_CONFIGS.map(async (config) => {
			const response = await axios.get<SamSearchResponse>(process.env.SAM_API_URL!, {
				params: {
					...commonParams,
					ncode: config.ncode,
				},
				headers: {
					Accept: 'application/json',
				},
				timeout: 30_000,
			});

			return {
				name: config.name,
				data: response.data.opportunitiesData ?? [],
			};
		}),
	);

	return responses;
}
