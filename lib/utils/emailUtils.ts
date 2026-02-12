import { Resend } from 'resend';

type SendFailure = {
	to: string;
	error: { message?: string; name?: string; statusCode?: number };
};
type SendSummary = {
	ok: boolean;
	successes: string[];
	failures: SendFailure[];
};

const resend = new Resend(process.env.RESEND_API_KEY!);

function parseRecipients(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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

		const successes: string[] = [];
		const failures: SendFailure[] = [];

		//* Send one email per recipient
		for (let i = 0; i < toList.length; i++) {
			const to = toList[i];

			//* Resend allows only up to 2 requests per second
			//* Rate-limit friendly spacing: ~550ms per send = <2/sec
			if (i > 0) await sleep(550);

			//* Simple retry for 429 (1 retry after 1 second)
			let attempt = 0;
			while (attempt < 2) {
				const res = await resend.emails.send({
					from: process.env.EMAIL_FROM!,
					to: [to],
					subject: opts.subject,
					react: opts.react,
					attachments: [{ filename: opts.filename, content: base64 }],
				});

				if (!res.error) {
					successes.push(to);
					break;
				}

				const statusCode = (res.error as any)?.statusCode as number | undefined;

				if (statusCode === 429 && attempt === 0) {
					attempt++;
					await sleep(1100); //* wait > 1s then retry
					continue;
				}

				failures.push({
					to,
					error: {
						message: (res.error as any)?.message,
						name: (res.error as any)?.name,
						statusCode,
					},
				});
				break;
			}
		}

		return { ok: failures.length === 0, successes, failures };
	} catch (err) {
		console.error(err);
		throw err;
	}
}
