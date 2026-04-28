import * as React from 'react';

/* eslint-disable @next/next/no-img-element */

type SourcesSoughtEmailProps = {
	pocName?: string;
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

export function SourcesSoughtEmail({
	pocName,
	opportunity,
	senderName,
	senderEmail,
	logoUrl,
}: SourcesSoughtEmailProps) {
	return (
		<div style={container}>
			<div style={card}>
				<div style={header}>
					<div style={brandLockup}>
						<img src={logoUrl} alt="Tepnology icon" style={logo} />
						<div>
							<p style={brandName}>Tepnology LLC</p>
							<p style={brandTagline}>Outreach and capability response</p>
						</div>
					</div>
				</div>

				<p style={paragraph}>Hello {pocName?.trim() ? pocName.trim() : 'there'},</p>

				<p style={paragraph}>
					I am reaching out on behalf of Tepnology LLC regarding the Sources
					Sought notice for <strong>{opportunity.title}</strong> (
					{opportunity.noticeId}).
				</p>

				<p style={paragraph}>
					We are interested in this requirement and would appreciate the
					opportunity to share our capabilities and relevant experience in
					support of this effort.
				</p>

				<div style={detailCard}>
					<p style={detailHeading}>Capability snapshot</p>
					<p style={detailLine}>
						<strong>Company:</strong> Tepnology LLC
					</p>
					<p style={detailLine}>
						<strong>Focus:</strong> Government contracting support across
						targeted service areas including parking, transportation, and
						facility operations.
					</p>
					<p style={detailLine}>
						<strong>What we can provide:</strong> Capability statement, relevant
						experience, and additional background aligned to this requirement.
					</p>
				</div>

				<div style={detailCard}>
					<p style={detailHeading}>For reference</p>
					{opportunity.solicitationNumber ? (
						<p style={detailLine}>
							<strong>Solicitation Number:</strong>{' '}
							{opportunity.solicitationNumber}
						</p>
					) : null}
					{opportunity.fullParentPathName ? (
						<p style={detailLine}>
							<strong>Agency:</strong> {opportunity.fullParentPathName}
						</p>
					) : null}
					{opportunity.responseDeadLine ? (
						<p style={detailLine}>
							<strong>Response Deadline:</strong>{' '}
							{formatDate(opportunity.responseDeadLine)}
						</p>
					) : null}
				</div>

				<p style={paragraph}>
					Please let us know the best way to provide a capability statement or
					any additional background your team would find helpful for market
					research and vendor review.
				</p>

				<p style={paragraph}>Thank you for your time and consideration.</p>

				<div style={signature}>
					<p style={paragraph}>Best regards,</p>
					<p style={signatureName}>{senderName}</p>
					<p style={signatureMeta}>Tepnology LLC</p>
					<p style={signatureMeta}>{senderEmail}</p>
					<div style={signatureLogoRow}>
						<img src={logoUrl} alt="Tepnology icon" style={signatureLogo} />
					</div>
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

const card: React.CSSProperties = {
	maxWidth: '680px',
	margin: '0 auto',
	backgroundColor: '#ffffff',
	borderRadius: '24px',
	padding: '32px',
	border: '1px solid #e5e7eb',
};

const header: React.CSSProperties = {
	marginBottom: '28px',
	paddingBottom: '20px',
	borderBottom: '1px solid #e5e7eb',
};

const brandLockup: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
};

const logo: React.CSSProperties = {
	width: '42px',
	height: '42px',
	borderRadius: '14px',
};

const brandName: React.CSSProperties = {
	margin: 0,
	fontSize: '16px',
	fontWeight: 700,
	color: '#111827',
};

const brandTagline: React.CSSProperties = {
	margin: '4px 0 0 0',
	fontSize: '12px',
	color: '#6b7280',
};

const paragraph: React.CSSProperties = {
	margin: '0 0 18px 0',
	fontSize: '15px',
	lineHeight: '1.7',
};

const detailCard: React.CSSProperties = {
	margin: '6px 0 22px 0',
	padding: '18px 20px',
	backgroundColor: '#fbf6ee',
	borderRadius: '18px',
	border: '1px solid #f1e2c8',
};

const detailHeading: React.CSSProperties = {
	margin: '0 0 10px 0',
	fontSize: '13px',
	fontWeight: 700,
	textTransform: 'uppercase',
	letterSpacing: '0.08em',
	color: '#9a3412',
};

const detailLine: React.CSSProperties = {
	margin: '0 0 8px 0',
	fontSize: '14px',
	lineHeight: '1.6',
};

const signature: React.CSSProperties = {
	marginTop: '28px',
	paddingTop: '20px',
	borderTop: '1px solid #e5e7eb',
};

const signatureName: React.CSSProperties = {
	margin: '16px 0 4px 0',
	fontSize: '15px',
	fontWeight: 700,
	color: '#111827',
};

const signatureMeta: React.CSSProperties = {
	margin: '0 0 4px 0',
	fontSize: '14px',
	color: '#4b5563',
};

const signatureLogoRow: React.CSSProperties = {
	marginTop: '16px',
};

const signatureLogo: React.CSSProperties = {
	width: '28px',
	height: '28px',
	borderRadius: '10px',
};
