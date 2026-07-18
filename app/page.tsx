const chromeStoreUrl =
  "https://chromewebstore.google.com/detail/fgihdiegnhkhkdbianlokkbkfddkgkid?utm_source=item-share-cb";

const supportedSites = [
  {
    name: "Seats.aero",
    href: "https://seats.aero",
    logo: "/site-logos/seats-aero.png",
    instructions: "Open an award card, then click ✦ Vantara.",
  },
  {
    name: "PointsYeah",
    href: "https://www.pointsyeah.com",
    logo: "/site-logos/pointsyeah.png",
    instructions: "Analyze directly beside the award result.",
  },
  {
    name: "Roame",
    href: "https://roame.travel",
    logo: "/site-logos/roame.png",
    instructions: "Expand the result, then run Vantara.",
  },
  {
    name: "Point.me",
    href: "https://point.me",
    logo: "/site-logos/point-me.png",
    instructions: "Analyze the displayed cash and transfer pricing.",
  },
  {
    name: "AwardTool",
    href: "https://awardtool.com",
    logo: "/site-logos/awardtool.png",
    instructions: "Expand the itinerary, then click Vantara.",
  },
];

const analysisChecks = [
  {
    label: "Redemption value",
    value: "Is this award actually worth the points?",
  },
  {
    label: "Cash comparison",
    value: "Would paying cash be the smarter choice?",
  },
  {
    label: "Transfer path",
    value: "Which points currency should you use?",
  },
  {
    label: "Wallet fit",
    value: "Can your current wallet cover the booking?",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060A] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute right-0 top-[30rem] h-96 w-96 rounded-full bg-amber-700/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-700/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <nav className="flex items-center justify-between border-b border-white/10 py-6">
          <div>
            <p className="font-serif text-2xl tracking-tight">Vantara</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.34em] text-purple-300">
              Award decision intelligence
            </p>
          </div>

          <a
            href={chromeStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-purple-300/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-100 transition hover:border-purple-300/70 hover:bg-purple-500/20 md:px-5"
          >
            Get Extension
          </a>
        </nav>

        <section className="pb-8 pt-10 text-center md:pb-10 md:pt-12">
  <h1 className="mx-auto max-w-5xl font-serif text-4xl font-normal leading-[0.98] tracking-tight md:text-6xl">
    The decision layer for the award search sites you already use.
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
    Find award space normally. Vantara reads the selected itinerary and
    tells you whether to book with points, compare alternatives, or pay
    cash.
  </p>

  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
    <a
      href={chromeStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full bg-white px-7 py-3.5 text-center font-semibold text-slate-950 transition hover:bg-purple-100 sm:w-auto"
    >
      Add Vantara to Chrome
    </a>

    <a
      href="#supported-sites"
      className="w-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-center font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
    >
      Choose a search site
    </a>
  </div>

  <p className="mt-3 text-xs leading-5 text-slate-500">
    Install once. Build your wallet once. Analyze wherever you search.
  </p>
</section>

        <section id="supported-sites" className="pb-12">
  <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="font-serif text-3xl font-normal text-white md:text-4xl">
        Start with your preferred search engine.
      </h2>
    </div>

    <p className="max-w-md text-sm leading-6 text-slate-500">
      Vantara does not replace these tools. It adds analysis after you
      find an award.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
    {supportedSites.map((site) => (
      <a
        key={site.name}
        href={site.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-[15rem] flex-col overflow-hidden border border-white/10 bg-[#090B12]/95 p-4 transition duration-300 hover:-translate-y-1 hover:border-purple-300/40 hover:bg-purple-500/[0.08]"
      >
        <div className="flex h-24 items-center justify-center border border-white/10 bg-black/25 p-5">
          <img
            src={site.logo}
            alt={`${site.name} logo`}
            className="max-h-12 max-w-[82%] object-contain"
          />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">
            {site.name}
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {site.instructions}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs font-semibold text-purple-200">
          <span>Open site</span>
          <span className="transition group-hover:translate-x-1">→</span>
        </div>
      </a>
    ))}
  </div>

  <div className="mt-4 flex flex-col gap-4 border border-purple-300/20 bg-purple-500/[0.07] p-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="font-semibold text-white">
        Add Vantara before opening a search site
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-400">
        The extension adds Vantara directly to supported award results.
      </p>
    </div>

    <a
      href={chromeStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 justify-center bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-purple-100"
    >
      Get Chrome Extension
    </a>
  </div>
</section>

        <section className="border-y border-white/10 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-purple-300">
                One layer. Three steps.
              </p>

              <h2 className="mt-4 max-w-xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl">
                Find the award there. Make the decision with Vantara.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                Vantara reads the award you selected, compares it with the
                available cash fare, checks your transferable-points wallet,
                and returns a clear recommendation.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  step: "01",
                  title: "Search normally",
                  body: "Use any supported award-search website to find availability.",
                },
                {
                  step: "02",
                  title: "Select an itinerary",
                  body: "Open the award details and click the embedded Vantara control.",
                },
                {
                  step: "03",
                  title: "Get the decision",
                  body: "See value, wallet fit, transfer strategy, and booking guidance.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="grid grid-cols-[auto_1fr] gap-5 border border-white/10 bg-white/[0.025] p-5"
                >
                  <p className="pt-1 text-xs font-semibold text-purple-300">
                    {item.step}
                  </p>

                  <div>
                    <p className="text-lg font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-10 py-20 lg:grid-cols-[1fr_1.05fr]">
          <div className="border border-white/10 bg-[#090B12]/95 p-5">
            <div className="border border-purple-300/25 bg-purple-500/10 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-purple-300">
                Vantara recommendation
              </p>

              <h2 className="mt-3 font-serif text-3xl font-normal text-white">
                Book with points
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Strong redemption value, an efficient transfer path, and enough
                points in your wallet.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Redemption score", "86/100"],
                ["Value", "2.6¢ / point"],
                ["Best transfer", "Amex → Flying Club"],
                ["Bookability", "Valid"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border border-white/10 bg-white/[0.025] p-4"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-purple-300">
              What the search engine does not answer
            </p>

            <h2 className="mt-4 font-serif text-4xl font-normal leading-tight text-white">
              Availability is not the same as value.
            </h2>

            <div className="mt-7 grid gap-3">
              {analysisChecks.map((item) => (
                <div
                  key={item.label}
                  className="border border-white/10 bg-white/[0.025] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-purple-300">
                Why Vantara changed
              </p>

              <h2 className="mt-4 font-serif text-4xl font-normal text-white">
                We stopped trying to build another search engine.
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-8 text-slate-400">
              <p>
                Vantara originally began as an award-search product. But the
                strongest search tools already did a good job of finding award
                availability.
              </p>

              <p>
                The real gap appeared after the search: users still had to
                decide whether the redemption was valuable, which points to
                transfer, whether their wallet could cover it, and whether cash
                would be smarter.
              </p>

              <p className="text-slate-300">
                So Vantara became the layer above the search engines rather than
                another search engine competing with them.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-purple-300">
            Search there. Decide here.
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl">
            Add a decision layer to your next award search.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">
            Install Vantara, build your transferable-points wallet, and analyze
            awards directly on the sites you already use.
          </p>

          <a
            href={chromeStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex bg-white px-7 py-4 font-semibold text-slate-950 transition hover:bg-purple-100"
          >
            Get Vantara for Chrome
          </a>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Vantara.</p>
            <p>
              Vantara is not affiliated with airlines, banks, loyalty programs,
              or award-search tools.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}