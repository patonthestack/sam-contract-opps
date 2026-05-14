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
import type {
	OpportunitiesData,
	SamOpportunity,
	SamSearchResponse,
} from '@/types/sam/v2';

export type SamOpportunitySheet = {
	name: string;
	data: OpportunitiesData;
	groups: SamOpportunityGroup[];
};

export type SamOpportunityGroup = {
	groupKey: string;
	title: string;
	solicitationNumber?: string;
	primaryNotice: SamOpportunity;
	notices: SamOpportunity[];
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

function normalizeText(value?: string | null): string {
	return (value ?? '').trim().toLowerCase();
}

function normalizeSolicitationNumber(value?: string | null): string {
	return normalizeText(value).replace(/[_-]\d+$/, '');
}

function buildProcurementGroupKey(opp: SamOpportunity): string | null {
	const normalizedSolicitationNumber = normalizeSolicitationNumber(
		opp.solicitationNumber,
	);
	const normalizedTitle = normalizeText(opp.title);

	if (normalizedSolicitationNumber && normalizedTitle) {
		return `${normalizedSolicitationNumber}::${normalizedTitle}`;
	}

	if (normalizedSolicitationNumber) {
		return normalizedSolicitationNumber;
	}

	return normalizedTitle || null;
}

function isPresolicitation(opp: SamOpportunity): boolean {
	const typeText = `${opp.type ?? ''} ${opp.baseType ?? ''}`.toLowerCase();
	return typeText.includes('presolicitation');
}

function parseDate(value?: string | null): number {
	if (!value) return Number.NEGATIVE_INFINITY;

	const time = new Date(value).getTime();
	return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function pickPreferredOpportunity(
	current: SamOpportunity,
	candidate: SamOpportunity,
): SamOpportunity {
	const currentIsPresolicitation = isPresolicitation(current);
	const candidateIsPresolicitation = isPresolicitation(candidate);

	if (currentIsPresolicitation !== candidateIsPresolicitation) {
		return candidateIsPresolicitation ? current : candidate;
	}

	const currentPostedDate = parseDate(current.postedDate);
	const candidatePostedDate = parseDate(candidate.postedDate);
	if (currentPostedDate !== candidatePostedDate) {
		return candidatePostedDate > currentPostedDate ? candidate : current;
	}

	const currentResponseDeadline = parseDate(current.responseDeadLine);
	const candidateResponseDeadline = parseDate(candidate.responseDeadLine);
	if (currentResponseDeadline !== candidateResponseDeadline) {
		return candidateResponseDeadline > currentResponseDeadline
			? candidate
			: current;
	}

	return current;
}

function groupOpportunities(opportunities: OpportunitiesData): SamOpportunityGroup[] {
	const grouped = new Map<string, SamOpportunity[]>();

	for (const opportunity of opportunities) {
		const groupKey = buildProcurementGroupKey(opportunity);
		if (!groupKey) {
			grouped.set(opportunity.noticeId, [opportunity]);
			continue;
		}

		const existing = grouped.get(groupKey) ?? [];
		existing.push(opportunity);
		grouped.set(groupKey, existing);
	}

	return [...grouped.entries()].map(([groupKey, notices]) => {
		const primaryNotice = notices.reduce((preferred, current) =>
			pickPreferredOpportunity(preferred, current),
		);
		const sortedNotices = [...notices].sort((left, right) => {
			if (left.noticeId === primaryNotice.noticeId) return -1;
			if (right.noticeId === primaryNotice.noticeId) return 1;

			return parseDate(right.postedDate) - parseDate(left.postedDate);
		});

		return {
			groupKey,
			title: primaryNotice.title,
			solicitationNumber: primaryNotice.solicitationNumber,
			primaryNotice,
			notices: sortedNotices,
		};
	});
}

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
				groups: groupOpportunities(response.data.opportunitiesData ?? []),
			};
		}),
	);

	return responses;
}
