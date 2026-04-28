import * as React from 'react';
import {
	JANITORIAL_SERVICES_NAICS_CODE,
	PARKING_AND_GARAGES_NAICS_CODE,
	SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE,
	TRANSPORTATION_NAICS_CODE,
} from '@/lib/utils/constants';

/* eslint-disable @next/next/no-img-element */

type CapabilityStatementAttachmentProps = {
	opportunity: {
		title: string;
		noticeId: string;
		solicitationNumber?: string;
		fullParentPathName?: string;
		responseDeadLine?: string | null;
	};
	senderName: string;
	senderEmail: string;
	logoUrl: string;
};

function formatDate(value?: string | null) {
	if (!value) return 'No date listed';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

export function CapabilityStatementAttachment({
	opportunity,
	senderName,
	senderEmail,
	logoUrl,
}: CapabilityStatementAttachmentProps) {
	return (
		<div style={container}>
			<div style={page}>
				<div style={header}>
					<div style={brandRow}>
						<img src={logoUrl} alt="Tepnology icon" style={logo} />
						<div>
							<p style={brandName}>Tepnology LLC</p>
							<p style={brandTagline}>Capability Statement</p>
						</div>
					</div>
				</div>

				<div style={heroCard}>
					<p style={eyebrow}>Prepared for market research and opportunity review</p>
					<h1 style={heading}>Capability Statement</h1>
					<p style={heroText}>
						Tepnology LLC supports public-sector opportunities across targeted
						service areas including parking, transportation, and facility
						operations.
					</p>
				</div>

				<div style={section}>
					<h2 style={sectionHeading}>Core capabilities</h2>
					<ul style={list}>
						<li>Parking operations and garage-related support services</li>
						<li>Ground passenger transportation coordination and support</li>
						<li>Special-needs transportation support</li>
						<li>Janitorial and facility support services</li>
					</ul>
				</div>

				<div style={section}>
					<h2 style={sectionHeading}>Target NAICS</h2>
					<ul style={list}>
						<li>{PARKING_AND_GARAGES_NAICS_CODE} - Parking Lots and Garages</li>
						<li>
							{SPECIAL_NEEDS_TRANSPORTATION_NAICS_CODE} - Special Needs
							Transportation
						</li>
						<li>{TRANSPORTATION_NAICS_CODE} - Ground Passenger Transportation</li>
						<li>{JANITORIAL_SERVICES_NAICS_CODE} - Janitorial Services</li>
					</ul>
				</div>

				<div style={section}>
					<h2 style={sectionHeading}>Why Tepnology</h2>
					<ul style={list}>
						<li>Focused on clearly defined public-sector service lanes</li>
						<li>Organized opportunity review and response preparation workflow</li>
						<li>Responsive team ready to provide additional background quickly</li>
					</ul>
				</div>

				<div style={section}>
					<h2 style={sectionHeading}>Opportunity reference</h2>
					<p style={paragraph}>
						<strong>Opportunity:</strong> {opportunity.title}
					</p>
					<p style={paragraph}>
						<strong>Notice ID:</strong> {opportunity.noticeId}
					</p>
					{opportunity.solicitationNumber ? (
						<p style={paragraph}>
							<strong>Solicitation Number:</strong>{' '}
							{opportunity.solicitationNumber}
						</p>
					) : null}
					{opportunity.fullParentPathName ? (
						<p style={paragraph}>
							<strong>Agency:</strong> {opportunity.fullParentPathName}
						</p>
					) : null}
					{opportunity.responseDeadLine ? (
						<p style={paragraph}>
							<strong>Response Deadline:</strong>{' '}
							{formatDate(opportunity.responseDeadLine)}
						</p>
					) : null}
				</div>

				<div style={footer}>
					<p style={footerHeading}>Primary contact</p>
					<p style={footerText}>{senderName}</p>
					<p style={footerText}>Tepnology LLC</p>
					<p style={footerText}>{senderEmail}</p>
				</div>
			</div>
		</div>
	);
}

const container: React.CSSProperties = {
	backgroundColor: '#f6efe4',
	padding: '24px',
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: '#1f2937',
};

const page: React.CSSProperties = {
	maxWidth: '760px',
	margin: '0 auto',
	backgroundColor: '#ffffff',
	borderRadius: '24px',
	padding: '32px',
	border: '1px solid #e5e7eb',
};

const header: React.CSSProperties = {
	marginBottom: '24px',
};

const brandRow: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
};

const logo: React.CSSProperties = {
	width: '48px',
	height: '48px',
	borderRadius: '16px',
};

const brandName: React.CSSProperties = {
	margin: 0,
	fontSize: '18px',
	fontWeight: 700,
	color: '#111827',
};

const brandTagline: React.CSSProperties = {
	margin: '4px 0 0 0',
	fontSize: '12px',
	color: '#6b7280',
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
};

const heroCard: React.CSSProperties = {
	backgroundColor: '#fbf6ee',
	border: '1px solid #f1e2c8',
	borderRadius: '22px',
	padding: '24px',
	marginBottom: '24px',
};

const eyebrow: React.CSSProperties = {
	margin: '0 0 10px 0',
	fontSize: '12px',
	fontWeight: 700,
	color: '#9a3412',
	textTransform: 'uppercase',
	letterSpacing: '0.08em',
};

const heading: React.CSSProperties = {
	margin: '0 0 12px 0',
	fontSize: '28px',
	lineHeight: '1.2',
	color: '#111827',
};

const heroText: React.CSSProperties = {
	margin: 0,
	fontSize: '15px',
	lineHeight: '1.7',
	color: '#374151',
};

const section: React.CSSProperties = {
	marginBottom: '24px',
};

const sectionHeading: React.CSSProperties = {
	margin: '0 0 12px 0',
	fontSize: '18px',
	fontWeight: 700,
	color: '#111827',
};

const list: React.CSSProperties = {
	margin: 0,
	paddingLeft: '22px',
	fontSize: '14px',
	lineHeight: '1.7',
	color: '#374151',
};

const paragraph: React.CSSProperties = {
	margin: '0 0 8px 0',
	fontSize: '14px',
	lineHeight: '1.7',
	color: '#374151',
};

const footer: React.CSSProperties = {
	borderTop: '1px solid #e5e7eb',
	paddingTop: '20px',
	marginTop: '12px',
};

const footerHeading: React.CSSProperties = {
	margin: '0 0 10px 0',
	fontSize: '14px',
	fontWeight: 700,
	color: '#111827',
};

const footerText: React.CSSProperties = {
	margin: '0 0 4px 0',
	fontSize: '14px',
	color: '#4b5563',
};
