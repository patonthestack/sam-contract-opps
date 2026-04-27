import Link from 'next/link';
import { fetchSamOpportunitySheets } from '@/lib/sam/fetchContractOpportunities';

type NoticeGuidance = {
	statusLabel: string;
	statusClassName: string;
	typeMeaning: string;
	recommendedAction: string;
	canSubmit: boolean;
	templateButtonLabel?: string;
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

function buildOfficeLocation(city?: string, state?: string, zip?: string) {
	return [city, state, zip].filter(Boolean).join(', ') || 'Location unavailable';
}

function toSectionId(name: string) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function getCategoryStyle(index: number) {
	const styles = [
		{
			accent: 'bg-orange-100 text-orange-800',
			badge: 'bg-orange-500',
			panel: 'from-orange-100/80 to-white',
		},
		{
			accent: 'bg-blue-100 text-blue-800',
			badge: 'bg-blue-500',
			panel: 'from-blue-100/80 to-white',
		},
		{
			accent: 'bg-amber-100 text-amber-800',
			badge: 'bg-amber-500',
			panel: 'from-amber-100/80 to-white',
		},
		{
			accent: 'bg-stone-200 text-stone-800',
			badge: 'bg-stone-500',
			panel: 'from-stone-200/80 to-white',
		},
	];

	return styles[index % styles.length];
}

function isAwardOpportunity(type?: string, baseType?: string) {
	const typeText = `${type ?? ''} ${baseType ?? ''}`.toLowerCase();
	return typeText.includes('award');
}

function isPastDate(value?: string | null) {
	if (!value) return false;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return false;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	date.setHours(0, 0, 0, 0);

	return date < today;
}

function getNoticeGuidance(type?: string, baseType?: string): NoticeGuidance {
	const typeText = `${type ?? ''} ${baseType ?? ''}`.toLowerCase();

	if (typeText.includes('combined synopsis/solicitation')) {
		return {
			statusLabel: 'Open for bidding',
			statusClassName: 'bg-emerald-100 text-emerald-800',
			typeMeaning: 'This notice is open now and may include both the overview and the solicitation details.',
			recommendedAction: 'Review the notice and attachments closely, confirm fit, and prepare a proposal before the deadline.',
			canSubmit: true,
			templateButtonLabel: 'Generate proposal template',
		};
	}

	if (typeText.includes('solicitation')) {
		return {
			statusLabel: 'Open for bidding',
			statusClassName: 'bg-emerald-100 text-emerald-800',
			typeMeaning: 'This is an active solicitation, which usually means the agency is accepting bids or proposals.',
			recommendedAction: 'Review the scope, requirements, and response instructions, then decide whether to submit.',
			canSubmit: true,
			templateButtonLabel: 'Generate proposal template',
		};
	}

	if (typeText.includes('sources sought')) {
		return {
			statusLabel: 'Market research',
			statusClassName: 'bg-blue-100 text-blue-800',
			typeMeaning: 'This is usually early market research. The agency is gathering information, not asking for a full proposal yet.',
			recommendedAction: 'Consider responding with capabilities, past performance, or interest to help position for a later bid.',
			canSubmit: false,
			templateButtonLabel: 'Generate capability statement template',
		};
	}

	if (typeText.includes('presolicitation')) {
		return {
			statusLabel: 'Coming soon',
			statusClassName: 'bg-violet-100 text-violet-800',
			typeMeaning: 'This signals that a formal solicitation may be released later, but it is not typically ready for full submission yet.',
			recommendedAction: 'Monitor the notice, gather teammates, and get ready for the official solicitation release.',
			canSubmit: false,
			templateButtonLabel: 'Generate pursuit prep template',
		};
	}

	if (typeText.includes('special notice')) {
		return {
			statusLabel: 'Review carefully',
			statusClassName: 'bg-orange-100 text-orange-800',
			typeMeaning: 'Special notices vary. Some are informational, while others may include limited actions or updates.',
			recommendedAction: 'Open the full notice and confirm whether it requests a response, meeting registration, or follow-up.',
			canSubmit: false,
		};
	}

	if (typeText.includes('intent to award')) {
		return {
			statusLabel: 'Likely noncompetitive',
			statusClassName: 'bg-amber-100 text-amber-800',
			typeMeaning: 'This often means the agency plans to award to a specific vendor rather than run an open competition.',
			recommendedAction: 'Treat this as informational unless the notice explicitly invites questions, capability statements, or challenges.',
			canSubmit: false,
		};
	}

	if (typeText.includes('award')) {
		return {
			statusLabel: 'Already awarded',
			statusClassName: 'bg-stone-200 text-stone-800',
			typeMeaning: 'The contract has already been awarded, so this is not an open bidding opportunity.',
			recommendedAction: 'Use it for market intelligence, teaming research, or competitor tracking rather than proposal work.',
			canSubmit: false,
		};
	}

	return {
		statusLabel: 'Needs review',
		statusClassName: 'bg-slate-200 text-slate-800',
		typeMeaning: 'This notice type is not clearly open or closed from the label alone.',
		recommendedAction: 'Open the notice and confirm whether it invites a response, request for information, or future action.',
		canSubmit: false,
	};
}

export default async function SamOpportunitiesPage() {
	const sheets = await fetchSamOpportunitySheets();
	const totalOpportunities = sheets.reduce(
		(total, sheet) => total + sheet.data.length,
		0,
	);

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(242,191,123,0.45),_transparent_24%),linear-gradient(180deg,_#faf5ed_0%,_#f4efe6_42%,_#ebe1d4_100%)] text-slate-900">
			<div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
				<div className="flex flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-3xl">
							<p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-orange-700">
								SAM opportunity board
							</p>
							<h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
								Live contract opportunities across Tepnology&apos;s target lanes
							</h1>
							<p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
								Review active opportunities in one place, scan each category
								quickly, and jump into the listings that matter most to your team.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link
								href="/"
								className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5"
							>
								Back to landing page
							</Link>
							<a
								href="/api/sam/contractOpportunities/export"
								className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-slate-800"
							>
								Download Excel export
							</a>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-[1.5rem] border border-slate-900/10 bg-[rgba(250,245,237,0.9)] p-5">
							<p className="text-sm font-medium text-slate-500">Tracked lanes</p>
							<p className="mt-2 font-display text-3xl font-semibold text-slate-950">
								{sheets.length}
							</p>
						</div>
						<div className="rounded-[1.5rem] border border-slate-900/10 bg-[rgba(250,245,237,0.9)] p-5">
							<p className="text-sm font-medium text-slate-500">Opportunities found</p>
							<p className="mt-2 font-display text-3xl font-semibold text-slate-950">
								{totalOpportunities}
							</p>
						</div>
						<div className="rounded-[1.5rem] border border-slate-900/10 bg-[rgba(250,245,237,0.9)] p-5">
							<p className="text-sm font-medium text-slate-500">Listings from</p>
							<p className="mt-2 font-display text-2xl font-semibold text-slate-950">
								SAM.gov
							</p>
						</div>
					</div>
				</div>

				<section className="mt-8 rounded-[2rem] border border-slate-900/10 bg-white/65 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="font-display text-xl font-semibold text-slate-950">
								How to read these notices
							</p>
							<p className="mt-1 text-sm text-slate-600">
								Some notice types are open for response, while others are informational only.
							</p>
						</div>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						{[
							['Solicitation', 'Usually open for bidding now'],
							['Sources Sought', 'Early market research, not a full proposal'],
							['Presolicitation', 'Likely coming soon, monitor for release'],
							['Award Notice', 'Already awarded, no proposal to submit'],
						].map(([label, text]) => (
							<div
								key={label}
								className="rounded-[1.35rem] border border-slate-900/10 bg-[rgba(250,245,237,0.88)] p-4"
							>
								<p className="font-display text-lg font-semibold text-slate-950">
									{label}
								</p>
								<p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
							</div>
						))}
					</div>
				</section>

				<section className="mt-8 rounded-[2rem] border border-slate-900/10 bg-white/65 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="font-display text-xl font-semibold text-slate-950">
								Jump to a category
							</p>
							<p className="mt-1 text-sm text-slate-600">
								Choose a service area below to jump straight to its opportunities.
							</p>
						</div>
						<p className="text-sm font-medium text-slate-500">
							4 tracked NAICS groups
						</p>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						{sheets.map((sheet, index) => {
							const style = getCategoryStyle(index);
							const sectionId = toSectionId(sheet.name);

							return (
								<a
									key={sheet.name}
									href={`#${sectionId}`}
									className="group rounded-[1.5rem] border border-slate-900/10 bg-[rgba(250,245,237,0.88)] p-4 hover:-translate-y-0.5 hover:bg-white"
								>
									<div className="flex items-center gap-3">
										<div
											className={`h-3 w-3 rounded-full ${style.badge}`}
										/>
										<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
											Category {index + 1}
										</p>
									</div>
									<p className="mt-3 font-display text-lg font-semibold text-slate-950">
										{sheet.name}
									</p>
									<span
										className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style.accent}`}
									>
										{sheet.data.length} opportunities
									</span>
								</a>
							);
						})}
					</div>
				</section>

				<div className="mt-10 grid gap-8">
					{sheets.map((sheet, index) => {
						const style = getCategoryStyle(index);
						const sectionId = toSectionId(sheet.name);

						return (
						<section
							id={sectionId}
							key={sheet.name}
							className="rounded-[2rem] border border-slate-900/10 bg-white/70 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8"
						>
							<div
								className={`rounded-[1.6rem] bg-gradient-to-r ${style.panel} p-5`}
							>
								<div className="flex flex-col gap-3 border-b border-slate-900/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<div className="flex items-center gap-3">
											<div className={`h-3.5 w-3.5 rounded-full ${style.badge}`} />
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
												Service lane {index + 1}
											</p>
										</div>
										<p className="mt-3 font-display text-2xl font-semibold text-slate-950">
											{sheet.name}
										</p>
										<p className="mt-2 text-sm text-slate-600">
											{sheet.data.length} opportunities in this service area
										</p>
									</div>
									<div className={`rounded-full px-4 py-2 text-sm font-semibold ${style.accent}`}>
										{sheet.data.length} listings
									</div>
								</div>
							</div>

							<div className="mt-6">
							{sheet.data.length === 0 ? (
								<div className="rounded-[1.5rem] bg-[rgba(250,245,237,0.82)] px-5 py-8 text-sm text-slate-600">
									No active opportunities were returned for this category right now.
								</div>
							) : (
								<div className="grid gap-4">
									{sheet.data.map((opp) => {
										const primaryPoc =
											opp.pointOfContact?.find((contact) => contact.type === 'primary') ??
											opp.pointOfContact?.[0];
										const isAward = isAwardOpportunity(opp.type, opp.baseType);
										const responseDeadlinePassed = isPastDate(opp.responseDeadLine);
										const noticeGuidance = getNoticeGuidance(
											opp.type,
											opp.baseType,
										);

										return (
											<article
												key={`${sheet.name}-${opp.noticeId}`}
												className="rounded-[1.5rem] border border-slate-900/10 bg-[rgba(250,245,237,0.82)] p-5"
											>
												<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
													<div className="max-w-3xl">
														<div className="flex flex-wrap gap-2">
															<span
																className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
																	isAward
																		? 'bg-amber-300 text-amber-950'
																		: 'bg-slate-900 text-white'
																}`}
															>
																{opp.type ?? 'Opportunity'}
															</span>
															<span
																className={`rounded-full px-3 py-1 text-xs font-semibold ${noticeGuidance.statusClassName}`}
															>
																{noticeGuidance.statusLabel}
															</span>
															{isAward ? (
																<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
																	Award notice only
																</span>
															) : null}
															{opp.typeOfSetAsideDescription ? (
																<span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.accent}`}>
																	{opp.typeOfSetAsideDescription}
																</span>
															) : null}
														</div>

														<h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-slate-950">
															{opp.title}
														</h2>

														<p className="mt-3 text-sm leading-7 text-slate-700">
															{opp.fullParentPathName ?? 'Agency not provided'}
														</p>

														<div className="mt-5 grid gap-3 md:grid-cols-2">
															<div className="rounded-2xl border border-slate-900/10 bg-white/75 p-4">
																<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
																	What this notice means
																</p>
																<p className="mt-2 text-sm leading-6 text-slate-700">
																	{noticeGuidance.typeMeaning}
																</p>
															</div>
															<div className="rounded-2xl border border-slate-900/10 bg-white/75 p-4">
																<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
																	Recommended next step
																</p>
																<p className="mt-2 text-sm leading-6 text-slate-700">
																	{noticeGuidance.recommendedAction}
																</p>
															</div>
														</div>
													</div>

													<div className="grid gap-2 text-sm text-slate-600 sm:min-w-64">
														<div>
															<span className="font-semibold text-slate-900">
																Notice ID:
															</span>{' '}
															{opp.noticeId}
														</div>
														<div>
															<span className="font-semibold text-slate-900">
																Posted:
															</span>{' '}
															{formatDate(opp.postedDate)}
														</div>
														<div>
															<span className="font-semibold text-slate-900">
																Response deadline:
															</span>{' '}
															<span
																className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
																	responseDeadlinePassed
																		? 'bg-red-100 text-red-800'
																		: 'bg-emerald-100 text-emerald-800'
																}`}
															>
																{responseDeadlinePassed
																	? `Passed ${formatDate(opp.responseDeadLine)}`
																	: formatDate(opp.responseDeadLine)}
															</span>
														</div>
														<div>
															<span className="font-semibold text-slate-900">
																NAICS:
															</span>{' '}
															{opp.naicsCode ?? 'Not listed'}
														</div>
														<div>
															<span className="font-semibold text-slate-900">
																Action:
															</span>{' '}
															<span
																className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
																	noticeGuidance.canSubmit
																		? 'bg-emerald-100 text-emerald-800'
																		: 'bg-slate-200 text-slate-800'
																}`}
															>
																{noticeGuidance.canSubmit
																	? 'Proposal may be possible'
																	: 'Review only or monitor'}
															</span>
														</div>
													</div>
												</div>

												<div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
													<div className="rounded-2xl bg-white/75 p-4">
														<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
															Solicitation
														</p>
														<p className="mt-2 font-medium text-slate-900">
															{opp.solicitationNumber ?? 'Not listed'}
														</p>
													</div>
													<div className="rounded-2xl bg-white/75 p-4">
														<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
															Office location
														</p>
														<p className="mt-2 font-medium text-slate-900">
															{buildOfficeLocation(
																opp.officeAddress?.city,
																opp.officeAddress?.state,
																opp.officeAddress?.zipcode,
															)}
														</p>
													</div>
													<div className="rounded-2xl bg-white/75 p-4">
														<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
															Primary contact
														</p>
														<p className="mt-2 font-medium text-slate-900">
															{primaryPoc?.fullName ?? 'No contact listed'}
														</p>
														{primaryPoc?.email ? (
															<a
																href={`mailto:${primaryPoc.email}`}
																className="mt-1 inline-block text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
															>
																{primaryPoc.email}
															</a>
														) : (
															<p className="mt-1 text-slate-600">
																{primaryPoc?.phone ?? 'No email or phone'}
															</p>
														)}
													</div>
												</div>

												<div className="mt-5 flex flex-col gap-3 sm:flex-row">
													{noticeGuidance.templateButtonLabel ? (
														<button
															type="button"
															aria-disabled="true"
															className="cursor-not-allowed rounded-full bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-orange-400"
															title="Template generation coming soon"
														>
															{noticeGuidance.templateButtonLabel}
														</button>
													) : null}
													{opp.uiLink ? (
														<a
															href={opp.uiLink}
															target="_blank"
															rel="noreferrer"
															className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
														>
															View on SAM.gov
														</a>
													) : null}
													{opp.additionalInfoLink ? (
														<a
															href={opp.additionalInfoLink}
															target="_blank"
															rel="noreferrer"
															className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
														>
															Additional info
														</a>
													) : null}
												</div>
											</article>
										);
									})}
								</div>
							)}
							</div>
						</section>
						);
					})}
				</div>
			</div>
		</main>
	);
}
