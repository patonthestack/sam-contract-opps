import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

function parseRecipients(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

export async function sendReportEmail(opts: {
	subject: string;
	react: React.ReactElement;
	filename: string;
	attachment: ArrayBuffer;
}) {
	try {
		const toList = parseRecipients(process.env.EMAIL_TO);
		if (toList.length === 0) throw new Error('EMAIL_TO is empty');

		//* Resend expects attachment content as base64
		const base64 = Buffer.from(new Uint8Array(opts.attachment)).toString(
			'base64',
		);

		//* Send one email per recipient
		const results = await Promise.all(
			toList.map(async (to) => {
				const res = await resend.emails.send({
					from: process.env.EMAIL_FROM!,
					to: [to],
					subject: opts.subject,
					react: opts.react,
					attachments: [
						{
							filename: opts.filename,
							content: base64,
						},
					],
				});

				return { to, ...res };
			}),
		);

		const failures = results.filter((r) => r.error);

		return {
			ok: failures.length === 0,
			successes: results.filter((r) => !r.error).map((r) => r.to),
			failures: failures.map((f) => ({
				to: f.to,
				error: f.error,
			})),
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
}
