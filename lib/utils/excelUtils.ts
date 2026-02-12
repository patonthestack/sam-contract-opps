import ExcelJS from 'exceljs';
import type {
	OpportunitiesData,
	OpportunityRow,
	SamOpportunity,
} from '@/types/sam/v2';

//* Only allow these keys in ws.columns so you can't typo a key
type OpportunityRowKey = keyof OpportunityRow;

//* Typed column definition helper
type OpportunityColumn = {
	header: string;
	key: OpportunityRowKey;
	width?: number;
};

//* Helper: normalize anything "nullish" to empty string for Excel cells
function s(value: unknown): string {
	if (value === null || value === undefined) return '';
	return String(value);
}

//* Helper: join string arrays safely
function join(values?: string[] | null, delimiter = ', '): string {
	return Array.isArray(values) ? values.filter(Boolean).join(delimiter) : '';
}

function joinLines(values?: string[] | null): string {
	return Array.isArray(values) ? values.filter(Boolean).join('\n') : '';
}

//* Helper: pick primary point of contact (fully typed)
function pickPrimaryPoc(opp: SamOpportunity) {
	const pocs = opp.pointOfContact ?? [];
	return pocs.find((p) => p.type === 'primary') ?? pocs[0] ?? null;
}

function setHyperlink(cell: ExcelJS.Cell, url: string) {
	if (url.startsWith('http')) {
		cell.value = { text: url, hyperlink: url };
	} else {
		cell.value = url;
	}
}

const columns: OpportunityColumn[] = [
	{ header: 'Notice ID', key: 'noticeId', width: 36 },
	{ header: 'Title', key: 'title', width: 50 },
	{ header: 'Solicitation #', key: 'solicitationNumber', width: 18 },
	{ header: 'Posted Date', key: 'postedDate', width: 12 },
	{ header: 'Response Deadline', key: 'responseDeadLine', width: 16 },
	{ header: 'Archive Date', key: 'archiveDate', width: 12 },
	{ header: 'Active', key: 'active', width: 8 },

	{ header: 'Type', key: 'type', width: 26 },
	{ header: 'Set-Aside', key: 'typeOfSetAsideDescription', width: 34 },
	{ header: 'Set-Aside Code', key: 'typeOfSetAside', width: 14 },

	{ header: 'NAICS', key: 'naicsCode', width: 10 },
	{ header: 'NAICS Codes', key: 'naicsCodes', width: 18 },
	{ header: 'Class Code', key: 'classificationCode', width: 10 },

	{ header: 'Agency Path', key: 'fullParentPathName', width: 60 },
	{ header: 'Agency Code', key: 'fullParentPathCode', width: 20 },

	{ header: 'Office City', key: 'officeCity', width: 16 },
	{ header: 'Office State', key: 'officeState', width: 12 },
	{ header: 'Office Zip', key: 'officeZip', width: 12 },
	{ header: 'Office Country', key: 'officeCountry', width: 12 },

	{ header: 'POC Email', key: 'pocEmail', width: 28 },
	{ header: 'POC Name', key: 'pocFullName', width: 35 },
	{ header: 'POC Phone', key: 'pocPhone', width: 16 },
	{ header: 'POC Fax', key: 'pocFax', width: 16 },

	{ header: 'UI Link', key: 'uiLink', width: 55 },
	{ header: 'Description Link', key: 'descriptionLink', width: 55 },
	{ header: 'Additional Info Link', key: 'additionalInfoLink', width: 55 },

	{ header: 'Resource Links', key: 'resourceLinks', width: 55 },
];

function addOpportunitiesSheet(
	wb: ExcelJS.Workbook,
	sheetName: string,
	opps: OpportunitiesData,
) {
	const ws = wb.addWorksheet(sheetName);

	ws.columns = columns as ExcelJS.Column[];

	//* Header formatting
	ws.getRow(1).font = { bold: true };
	ws.views = [{ state: 'frozen', ySplit: 1 }];

	//* Add rows
	for (const opp of opps) {
		const poc = pickPrimaryPoc(opp);

		const row: OpportunityRow = {
			noticeId: s(opp.noticeId),
			title: s(opp.title),
			solicitationNumber: s(opp.solicitationNumber),
			postedDate: s(opp.postedDate),
			responseDeadLine: s(opp.responseDeadLine),
			archiveDate: s(opp.archiveDate),
			active: s(opp.active),

			type: s(opp.type),
			typeOfSetAsideDescription: s(opp.typeOfSetAsideDescription),
			typeOfSetAside: s(opp.typeOfSetAside),

			naicsCode: s(opp.naicsCode),
			naicsCodes: join(opp.naicsCodes),
			classificationCode: s(opp.classificationCode),

			fullParentPathName: s(opp.fullParentPathName),
			fullParentPathCode: s(opp.fullParentPathCode),

			officeCity: s(opp.officeAddress?.city),
			officeState: s(opp.officeAddress?.state),
			officeZip: s(opp.officeAddress?.zipcode),
			officeCountry: s(opp.officeAddress?.countryCode),

			pocEmail: s(poc?.email),
			pocFullName: s(poc?.fullName),
			pocPhone: s(poc?.phone),
			pocFax: s(poc?.fax),

			uiLink: s(opp.uiLink),
			descriptionLink: s(opp.description),
			additionalInfoLink: s(opp.additionalInfoLink),

			//* Excel can’t have multiple hyperlinks in a single cell; newline-separated is readable
			resourceLinks: joinLines(opp.resourceLinks),
		};

		ws.addRow(row);
	}

	//* Hyperlink single-link columns
	const linkKeys: OpportunityRowKey[] = [
		'uiLink',
		'descriptionLink',
		'additionalInfoLink',
	];

	for (const key of linkKeys) {
		const colIndex = columns.findIndex((c) => c.key === key) + 1;
		if (colIndex <= 0) continue;

		for (let r = 2; r <= ws.rowCount; r++) {
			const cell = ws.getCell(r, colIndex);
			const url =
				typeof cell.value === 'string' ? cell.value : String(cell.value ?? '');
			if (url) setHyperlink(cell, url);
		}
	}

	//* Wrap resourceLinks (newlines)
	const resourceLinksColIndex =
		columns.findIndex((c) => c.key === 'resourceLinks') + 1;
	if (resourceLinksColIndex > 0) {
		for (let r = 2; r <= ws.rowCount; r++) {
			ws.getCell(r, resourceLinksColIndex).alignment = { wrapText: true };
		}
	}
}

/**
 * Converts SAM opportunities into an XLSX file (as a Buffer).
 * You can store this buffer, email it, or return it from an API route.
 */
export async function samResponseToXlsxBuffer(
	sheets: Array<{ name: string; data: OpportunitiesData }>,
): Promise<ArrayBuffer> {
	const wb = new ExcelJS.Workbook();
	wb.creator = 'Tepnology LLC';
	wb.created = new Date();

	for (const sheet of sheets) {
		addOpportunitiesSheet(wb, sheet.name, sheet.data);
	}

	return wb.xlsx.writeBuffer();
}
