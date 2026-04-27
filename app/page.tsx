import Image from "next/image";

export default function Home() {
  const highlights = [
    {
      label: "Coverage",
      value: "SAM + local portals",
      description:
        "Federal and local opportunities brought into one easy view.",
    },
    {
      label: "Focus areas",
      value: "4 service tracks",
      description:
        "Parking, ground transportation, special-needs transportation, and janitorial.",
    },
    {
      label: "Delivery",
      value: "Branded reports",
      description:
        "Shareable reports that make it easier to review opportunities quickly.",
    },
  ];

  const serviceLanes = [
    "Parking lots and garages",
    "Ground passenger transportation",
    "Special-needs transportation",
    "Janitorial services",
  ];

  const howItWorks = [
    "Gather active opportunities from SAM.gov across Tepnology's key service areas.",
    "Track local procurement portals like Fairfax County alongside federal opportunities.",
    "Review and share organized opportunity reports without digging through multiple sites.",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(242,191,123,0.52),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(96,124,173,0.18),_transparent_28%),linear-gradient(180deg,_#faf5ed_0%,_#f4efe6_38%,_#e9dfd1_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-0 h-72 w-72 rounded-full bg-blue-900/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-stone-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center overflow-hidden rounded-[1.6rem] border border-slate-900/10 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <Image
                src="/tepnology-icon-70-70_myversion.png"
                alt="Tepnology logo"
                width={70}
                height={70}
                priority
                className="h-[4.1rem] w-[4.1rem] scale-[1.35] object-contain"
              />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-slate-950">
                Tepnology
              </p>
              <p className="text-sm text-slate-600">
                Contract opportunity intelligence
              </p>
            </div>
          </div>
            <a
            className="rounded-full border border-slate-900/10 bg-white/70 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-white"
            href="#how-it-works"
          >
            How it works
          </a>
        </header>

        <section className="grid gap-10 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-900/10 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
              Built for Tepnology&apos;s opportunity search
            </div>

            <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-balance text-slate-950 sm:text-6xl lg:text-7xl">
              Turn scattered bid portals into one confident daily read.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Tepnology helps teams find public-sector opportunities faster by
              bringing SAM.gov and county listings into one place, organizing
              them by service area, and making them easier to review.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-950/20 hover:-translate-y-0.5 hover:bg-slate-800"
                href="/sam-opportunities"
              >
                Browse live opportunities
              </a>
              <a
                className="rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-white"
                href="#focus"
              >
                Explore service lanes
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-slate-900/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,_rgba(31,42,68,0.98),_rgba(15,23,42,0.94))] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-[1.4rem] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
                    <Image
                      src="/tepnology-icon-70-70_myversion.png"
                      alt="Tepnology mark"
                      width={64}
                      height={64}
                      className="h-[3.7rem] w-[3.7rem] scale-[1.32] object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold">
                      Opportunity radar
                    </p>
                    <p className="text-sm text-slate-200/75">
                      A quick view of what&apos;s active right now
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-orange-200">
                  Active
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-200/70">
                      {item.label}
                    </p>
                    <p className="mt-3 font-display text-xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200/75">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-300/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-orange-100/75">
                  Reporting outcome
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  A clearer way to spot what deserves attention first.
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50/80">
                  From new opportunities to follow-up review, the experience is
                  designed to keep the important items easy to find.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="focus"
          className="grid gap-6 border-y border-slate-900/10 py-12 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-orange-700">
              Focus areas
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Targeted around the contracts Tepnology actually wants to win.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {serviceLanes.map((lane, index) => (
              <div
                key={lane}
                className="rounded-[1.75rem] border border-slate-900/10 bg-white/70 p-5 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold text-orange-700">
                  0{index + 1}
                </p>
                <p className="mt-3 font-display text-xl font-semibold text-slate-900">
                  {lane}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="grid gap-6 py-14 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-orange-200">
              Why this app matters
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Less manual searching. More time qualifying real fits.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200/80">
              Instead of bouncing between portals, teams can review relevant
              opportunities in one place and move faster on the ones worth
              pursuing.
            </p>
          </div>

          <div className="grid gap-4">
            {howItWorks.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.75rem] border border-slate-900/10 bg-[rgba(255,250,242,0.82)] p-5 shadow-sm"
              >
                <div className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-400 text-lg font-semibold text-slate-950">
                  {index + 1}
                </div>
                <p className="pt-1 text-base leading-7 text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
