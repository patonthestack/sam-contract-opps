import * as React from 'react';

interface SamReportEmailProps {
	recipientName?: string;
	reportDate: string;
	sheetSummaries: Array<{
		name: string;
		count: number;
	}>;
	companyName: string;
	logoUrl: string;
}

export function SamReportEmail({
	recipientName,
	reportDate,
	sheetSummaries,
	companyName,
	logoUrl,
}: SamReportEmailProps) {
	return (
		<div style={container}>
			<h2 style={heading}>SAM Opportunities Report – {reportDate}</h2>

			{recipientName && <p style={paragraph}>Hi {recipientName},</p>}

			<p style={paragraph}>
				Attached is your latest SAM opportunities report. Below is a quick
				summary of what’s included:
			</p>

			<ul style={list}>
				{sheetSummaries.map((sheet) => (
					<li key={sheet.name}>
						<strong>{sheet.name}</strong>: {sheet.count} opportunities
					</li>
				))}
			</ul>

			<hr style={divider} />

			{/* Footer */}
			<div style={footer}>
				<img src={logoUrl} alt={`${companyName} logo`} style={logo} />
				<p style={footerText}>
					© {new Date().getFullYear()} {companyName}
				</p>
			</div>
		</div>
	);
}

/* -------------------- */
/* Inline styles (email-safe) */
/* -------------------- */

const container: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	maxWidth: '600px',
	margin: '0 auto',
	padding: '24px',
	color: '#111827',
};

const heading: React.CSSProperties = {
	fontSize: '20px',
	marginBottom: '16px',
};

const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	marginBottom: '12px',
};

const list: React.CSSProperties = {
	paddingLeft: '20px',
	marginBottom: '16px',
	fontSize: '14px',
};

const divider: React.CSSProperties = {
	border: 'none',
	borderTop: '1px solid #e5e7eb',
	margin: '24px 0',
};

const footer: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
};

const logo: React.CSSProperties = {
	height: '72px',
	width: 'auto',
};

const footerText: React.CSSProperties = {
	fontSize: '12px',
	color: '#6b7280',
};
