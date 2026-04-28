import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Resend } from 'resend';

type RequestBody = {
	to: string;
	subject: string;
	html: string;
	replyTo: string;
	senderName: string;
	senderEmail: string;
	opportunity: {
		title: string;
		noticeId: string;
		solicitationNumber?: string;
		fullParentPathName?: string;
		responseDeadLine?: string | null;
	};
};

const resend = new Resend(process.env.RESEND_API_KEY!);

function isValidTepnologyEmail(email: string) {
	return email.trim().toLowerCase().endsWith('@tepnology.com');
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as RequestBody;

		if (
			!body.to ||
			!body.subject ||
			!body.html ||
			!body.replyTo ||
			!body.senderName ||
			!body.senderEmail ||
			!body.opportunity?.title ||
			!body.opportunity?.noticeId
		) {
			return Response.json(
				{ error: 'Missing required email fields' },
				{ status: 400 },
			);
		}

		if (!isValidTepnologyEmail(body.replyTo)) {
			return Response.json(
				{ error: 'Reply-to must use a tepnology.com email address' },
				{ status: 400 },
			);
		}

		const sendMode = process.env.SOURCES_SOUGHT_EMAIL_SEND_MODE ?? 'disabled';

		if (sendMode !== 'enabled') {
			return Response.json(
				{
					ok: false,
					mode: sendMode,
					message:
						'Sending is not enabled yet. This route is scaffolded for a future guarded send flow.',
				},
				{ status: 200 },
			);
		}

		const capabilityStatementPath = path.join(
			process.cwd(),
			'templates/pdf/Tepnology-Capability-Statement.pdf',
		);
		const capabilityStatementBase64 = (
			await fs.readFile(capabilityStatementPath)
		).toString('base64');

		const result = await resend.emails.send({
			from: process.env.EMAIL_FROM!,
			to: [body.to],
			subject: body.subject,
			html: body.html,
			replyTo: body.replyTo,
			attachments: [
				{
					filename: 'Tepnology-Capability-Statement.pdf',
					content: capabilityStatementBase64,
					contentType: 'application/pdf',
				},
			],
		});

		if (result.error) {
			return Response.json(
				{
					ok: false,
					error: {
						message: result.error.message,
						name: result.error.name,
					},
				},
				{ status: 502 },
			);
		}

		return Response.json(
			{
				ok: true,
				id: result.data?.id,
				message: 'Email sent successfully',
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error('Sources sought email send scaffold error', error);
		return Response.json(
			{ error: 'Unable to process send request' },
			{ status: 500 },
		);
	}
}
