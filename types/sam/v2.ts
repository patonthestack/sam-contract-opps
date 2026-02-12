export type SamOpportunity = {
	//* Core identifiers
	noticeId: string;
	title: string;

	//* Solicitation metadata
	solicitationNumber?: string;

	//* Organization hierarchy
	fullParentPathName?: string;
	fullParentPathCode?: string;

	//* Dates (SAM returns these as strings like "2026-01-12" or null)
	postedDate?: string;
	responseDeadLine?: string | null;
	archiveDate?: string;
	archiveType?: string;

	//* Opportunity categorization
	type?: string;
	baseType?: string;

	//* Status
	active?: 'Yes' | 'No' | string;

	//* Set-aside info (often null)
	typeOfSetAsideDescription?: string | null;
	typeOfSetAside?: string | null;

	//* NAICS / classification
	naicsCode?: string;
	naicsCodes?: string[];
	classificationCode?: string;

	//* Award info (sometimes missing or null)
	award?: {
		date?: string;
		number?: string;
	} | null;

	//* Point(s) of contact
	pointOfContact?: {
		fax?: string | null;
		type?: string; //* e.g. "primary"
		email?: string | null;
		phone?: string | null;
		title?: string | null;
		fullName?: string | null;
	}[];

	//* Description endpoint link (URL string)
	description?: string;

	//* Office / org info
	organizationType?: string; //* e.g. "OFFICE"

	//* Office address
	officeAddress?: {
		zipcode?: string;
		city?: string;
		countryCode?: string; //* e.g. "USA"
		state?: string;
	};

	//* Place of performance (SAM can vary in shape; sample shows empty objects)
	placeOfPerformance?: {
		city?: Record<string, unknown>;
		state?: Record<string, unknown>;
		country?: Record<string, unknown>;
	} | null;

	//* Optional link to other info
	additionalInfoLink?: string | null;

	//* Link to SAM UI page
	uiLink?: string;

	//* Related links (self link, etc.)
	links?: {
		rel?: string; //* e.g. "self"
		href?: string;
	}[];

	//* Resource download links (often null or absent)
	resourceLinks?: string[] | null;
};

export type OpportunityRow = {
	//* Core identifiers
	noticeId: string;
	title: string;
	solicitationNumber?: string;

	//* Agency / hierarchy
	fullParentPathName?: string;
	fullParentPathCode?: string;
	organizationType?: string;

	//* Dates
	postedDate?: string;
	responseDeadLine?: string | null;
	archiveDate?: string;
	archiveType?: string;

	//* Classification
	type?: string;
	baseType?: string;
	active?: string;

	typeOfSetAsideDescription?: string | null;
	typeOfSetAside?: string | null;

	naicsCode?: string;
	naicsCodes?: string;
	classificationCode?: string;

	//* Award (flattened)
	awardDate?: string | null;
	awardNumber?: string | null;

	//* Office address
	officeCity?: string;
	officeState?: string;
	officeZip?: string;
	officeCountry?: string;

	//* Place of performance (best-effort flatten)
	placeOfPerformanceCity?: string;
	placeOfPerformanceState?: string;
	placeOfPerformanceCountry?: string;

	//* Point of contact (primary or first)
	pocType?: string;
	pocFullName?: string;
	pocTitle?: string | null;
	pocEmail?: string | null;
	pocPhone?: string | null;
	pocFax?: string | null;

	//* Links
	descriptionLink?: string;
	additionalInfoLink?: string | null;
	uiLink?: string;
	apiSelfLink?: string;
	resourceLinks?: string;
};

export type OpportunitiesData = SamOpportunity[];

export type SamSearchResponse = {
	totalRecords: number;
	limit: number;
	offset: number;
	opportunitiesData: OpportunitiesData;
};
