import { render } from '@react-email/render';
import { SourcesSoughtEmail } from '@/lib/email/templates/SourcesSoughtEmail';

type RequestBody = {
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
};

function isValidTepnologyEmail(email: string) {
	return email.trim().toLowerCase().endsWith('@tepnology.com');
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as RequestBody;

		if (!body.senderName?.trim() || !isValidTepnologyEmail(body.senderEmail)) {
			return Response.json(
				{ error: 'Invalid sender details' },
				{ status: 400 },
			);
		}

		const subject = `Sources Sought Response - ${body.opportunity.title}`;
		const logoUrl = `${process.env.PUBLIC_BASE_URL}/tepnology-icon-32x32.png`;

		const html = await render(
			SourcesSoughtEmail({
				pocName: body.pocName,
				opportunity: body.opportunity,
				senderName: body.senderName.trim(),
				senderEmail: body.senderEmail.trim(),
				logoUrl,
			}),
		);

		return Response.json(
			{
				ok: true,
				subject,
				html,
				capabilityStatementFilename: 'Tepnology-Capability-Statement.pdf',
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch (error) {
		console.error('Sources sought email render error', error);
		return Response.json(
			{ error: 'Unable to generate email draft' },
			{ status: 500 },
		);
	}
}
