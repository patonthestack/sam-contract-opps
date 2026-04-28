'use client';

import { useEffect, useState } from 'react';

type SourcesSoughtEmailButtonProps = {
	pocEmail: string;
	pocName?: string;
	sendEnabled: boolean;
	opportunity: {
		title: string;
		noticeId: string;
		solicitationNumber?: string;
		fullParentPathName?: string;
		responseDeadLine?: string | null;
	};
};

function isValidTepnologyEmail(email: string) {
	return email.trim().toLowerCase().endsWith('@tepnology.com');
}

export function SourcesSoughtEmailButton({
	pocEmail,
	pocName,
	sendEnabled,
	opportunity,
}: SourcesSoughtEmailButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [senderName, setSenderName] = useState(() => {
		if (typeof window === 'undefined') return '';
		return window.localStorage.getItem('sourcesSoughtSenderName') ?? '';
	});
	const [senderEmail, setSenderEmail] = useState(() => {
		if (typeof window === 'undefined') return '';
		return window.localStorage.getItem('sourcesSoughtSenderEmail') ?? '';
	});
	const [htmlDraft, setHtmlDraft] = useState('');
	const [subject, setSubject] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [copyStatus, setCopyStatus] = useState('');
	const [previewError, setPreviewError] = useState('');
	const [sendStatus, setSendStatus] = useState('');

	useEffect(() => {
		if (senderName) {
			window.localStorage.setItem('sourcesSoughtSenderName', senderName);
		}
		if (senderEmail) {
			window.localStorage.setItem('sourcesSoughtSenderEmail', senderEmail);
		}
	}, [senderEmail, senderName]);

	const emailIsValid = isValidTepnologyEmail(senderEmail);
	const canGenerate = senderName.trim().length > 0 && emailIsValid;

	useEffect(() => {
		if (!isOpen || !canGenerate) return;

		let cancelled = false;

		async function loadDraft() {
			setIsGenerating(true);
			setPreviewError('');

			try {
				const response = await fetch(
					'/api/sam/contractOpportunities/sourcesSoughtEmail',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							pocName,
							opportunity,
							senderName: senderName.trim(),
							senderEmail: senderEmail.trim(),
						}),
					},
				);

				if (!response.ok) {
					throw new Error('Draft generation failed');
				}

				const payload = (await response.json()) as {
					html: string;
					subject: string;
				};

				if (!cancelled) {
					setHtmlDraft(payload.html);
					setSubject(payload.subject);
				}
			} catch {
				if (!cancelled) {
					setPreviewError(
						'Unable to generate the branded email draft right now.',
					);
				}
			} finally {
				if (!cancelled) {
					setIsGenerating(false);
				}
			}
		}

		void loadDraft();

		return () => {
			cancelled = true;
		};
	}, [canGenerate, isOpen, opportunity, pocName, senderEmail, senderName]);

	async function copyToClipboard(value: string, successMessage: string) {
		try {
			await navigator.clipboard.writeText(value);
			setCopyStatus(successMessage);
			window.setTimeout(() => setCopyStatus(''), 2000);
		} catch {
			setCopyStatus('Copy failed');
			window.setTimeout(() => setCopyStatus(''), 2000);
		}
	}

	async function sendEmail() {
		if (!sendEnabled || !htmlDraft || !subject || !canGenerate) return;

		setIsSending(true);
		setSendStatus('');

		try {
			const response = await fetch(
				'/api/sam/contractOpportunities/sourcesSoughtEmail/send',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						to: pocEmail,
						subject,
						html: htmlDraft,
						replyTo: senderEmail.trim(),
					}),
				},
			);

			const payload = (await response.json()) as {
				ok?: boolean;
				message?: string;
				error?: { message?: string };
			};

			if (!response.ok || !payload.ok) {
				throw new Error(
					payload.error?.message ?? payload.message ?? 'Send failed',
				);
			}

			setSendStatus('Email sent successfully');
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Unable to send email';
			setSendStatus(message);
		} finally {
			setIsSending(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="cursor-pointer rounded-full bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-orange-400"
			>
				Draft intro email to POC
			</button>

			{isOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
					<div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-slate-900/10 bg-[linear-gradient(180deg,_#fffdf9_0%,_#f6efe4_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-8">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="font-display text-2xl font-semibold text-slate-950">
									Draft email to POC
								</p>
								<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
									Enter your Tepnology name and email to generate a branded HTML
									email draft with the Tepnology logo.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="cursor-pointer rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							>
								Close
							</button>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-900">
									Your name
								</span>
								<input
									value={senderName}
									onChange={(event) => setSenderName(event.target.value)}
									placeholder="John Doe"
									className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-400"
								/>
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-900">
									Your Tepnology email
								</span>
								<input
									value={senderEmail}
									onChange={(event) => setSenderEmail(event.target.value)}
									placeholder="name@tepnology.com"
									className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-400"
								/>
								{senderEmail && !emailIsValid ? (
									<p className="text-xs font-medium text-red-700">
										Use your `@tepnology.com` email address.
									</p>
								) : null}
							</label>
						</div>

						<div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-white/85 p-5">
							<div className="flex flex-wrap gap-4 text-sm text-slate-600">
								<p>
									<span className="font-semibold text-slate-900">To:</span>{' '}
									{pocEmail}
								</p>
								<p>
									<span className="font-semibold text-slate-900">Subject:</span>{' '}
									{subject || `Sources Sought Response - ${opportunity.title}`}
								</p>
							</div>

							<div className="mt-5 rounded-[1.25rem] bg-[rgba(250,245,237,0.9)] p-3">
								{isGenerating ? (
									<div className="space-y-3 p-4">
										<div className="h-5 w-40 rounded-full bg-slate-200" />
										<div className="h-4 w-full rounded-full bg-slate-200" />
										<div className="h-4 w-11/12 rounded-full bg-slate-200" />
										<div className="h-28 rounded-2xl bg-slate-200" />
									</div>
								) : previewError ? (
									<p className="p-4 text-sm text-red-700">{previewError}</p>
								) : htmlDraft ? (
									<iframe
										title="Sources sought email preview"
										srcDoc={htmlDraft}
										className="h-[560px] w-full rounded-[1rem] border border-slate-900/10 bg-white"
									/>
								) : (
									<div className="p-4 text-sm text-slate-600">
										Enter your Tepnology details to generate the HTML draft.
									</div>
								)}
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="cursor-pointer rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => void sendEmail()}
								disabled={
									!sendEnabled ||
									!htmlDraft ||
									isGenerating ||
									isSending ||
									!canGenerate
								}
								title={
									sendEnabled
										? 'Send this email from the app'
										: 'Sending from the app is not enabled yet'
								}
								className={`rounded-full px-5 py-3 text-center text-sm font-semibold shadow-sm transition ${
									sendEnabled &&
									htmlDraft &&
									!isGenerating &&
									!isSending &&
									canGenerate
										? 'cursor-pointer bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800'
										: 'cursor-pointer bg-slate-300 text-slate-600'
								}`}
							>
								{isSending ? 'Sending...' : 'Send email'}
							</button>
							<button
								type="button"
								onClick={() =>
									copyToClipboard(
										subject || `Sources Sought Response - ${opportunity.title}`,
										'Subject copied',
									)
								}
								disabled={!canGenerate}
								className={`rounded-full px-5 py-3 text-center text-sm font-semibold transition ${
									canGenerate
										? 'cursor-pointer border border-slate-900/10 bg-white text-slate-800 hover:bg-slate-50'
										: 'cursor-pointer border border-slate-900/10 bg-white text-slate-400'
								}`}
							>
								Copy subject
							</button>
							<button
								type="button"
								onClick={() => copyToClipboard(htmlDraft, 'HTML copied')}
								disabled={!htmlDraft || isGenerating}
								className={`rounded-full px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition ${
									htmlDraft && !isGenerating
										? 'cursor-pointer bg-orange-500 shadow-orange-500/15 hover:-translate-y-0.5 hover:bg-orange-400'
										: 'cursor-pointer bg-orange-300 shadow-orange-300/10'
								}`}
							>
								Copy HTML email
							</button>
						</div>
						{copyStatus ? (
							<p className="mt-3 text-right text-sm font-medium text-slate-600">
								{copyStatus}
							</p>
						) : null}
						{sendStatus ? (
							<p className="mt-2 text-right text-sm font-medium text-slate-600">
								{sendStatus}
							</p>
						) : null}
					</div>
				</div>
			) : null}
		</>
	);
}
