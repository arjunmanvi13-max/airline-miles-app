import Link from "next/link";

const feedbackFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSfevx7WkSwVD8wqhgji3rGlcaUeN-s5ha9ksNBt5QhRmmc-Gg/viewform?usp=dialog";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 bg-amber-700/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 py-6 md:px-8">
        <nav className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-serif tracking-tight">Vantara</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-purple-300">
              Award decision intelligence
            </p>
          </div>

          <Link
            href="/app"
            className="border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
          >
            Open App
          </Link>
        </nav>

        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex border border-purple-300/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
              Upload an award. Know if it is worth booking.
            </div>

            <h1 className="max-w-4xl text-5xl font-serif font-normal tracking-tight text-white md:text-7xl">
              The decision layer for award travel.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Vantara helps you analyze award redemptions through your actual
              points wallet. Upload a screenshot or enter award details manually,
              then get transfer recommendations, wallet fit, redemption value,
              and booking guidance.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="bg-white px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-purple-100"
              >
                Build wallet & analyze award
              </Link>

              <a
                href={feedbackFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 bg-white/[0.04] px-6 py-4 text-center font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Leave feedback
              </a>
            </div>

            <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500">
              Always verify award availability before transferring
              points. Transfers are often irreversible.
            </p>
          </div>

          <div className="border border-white/10 bg-[#090B12]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <div className="border border-purple-300/25 bg-purple-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-purple-300">
                Vantara recommendation
              </p>

              <h2 className="mt-3 text-3xl font-serif font-normal text-white">
                Book with points
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Strong redemption value, enough points in wallet, and a clean
                transfer path.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Best transfer</p>
                <p className="mt-2 font-semibold text-white">
                  Chase → MileagePlus
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Wallet fit</p>
                <p className="mt-2 font-semibold text-white">Excellent</p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Required</p>
                <p className="mt-2 font-semibold text-white">37,500 pts</p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Value</p>
                <p className="mt-2 font-semibold text-white">2.1¢ / point</p>
              </div>
            </div>

            <div className="mt-4 border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">
                What Vantara checks
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>• Can your wallet book this award?</p>
                <p>• Which transfer path is most efficient?</p>
                <p>• Are you short points?</p>
                <p>• Is the redemption value strong?</p>
                <p>• Should you book, wait, or pay cash?</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 border-t border-white/10 py-16 md:grid-cols-3">
          {[
            {
              title: "Wallet-first analysis",
              body: "Save your Amex, Chase, Capital One, Bilt, Citi, and Wells Fargo balances so every recommendation is personalized.",
            },
            {
              title: "Award screenshot intake",
              body: "Upload a screenshot from an award tool or airline site, then analyze the booking with your actual points wallet.",
            },
            {
              title: "Transfer strategy",
              body: "See where to transfer, how many points you need, whether you are short, and whether a bonus changes the decision.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="border-y border-white/10 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
                How it works
              </p>

              <h2 className="mt-3 text-4xl font-serif font-normal text-white">
                From award screenshot to booking decision.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Vantara is being built around the moment after you find award
                space: deciding whether it is worth booking and how to book it
                with the points you already have.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  step: "01",
                  title: "Build your wallet",
                  body: "Select your points ecosystems and enter optional balances.",
                },
                {
                  step: "02",
                  title: "Upload or enter an award",
                  body: "Add a screenshot or manually enter airline, miles, taxes, cabin, and route.",
                },
                {
                  step: "03",
                  title: "Get a recommendation",
                  body: "Vantara checks transfer options, wallet fit, point value, and booking risk.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="grid grid-cols-[auto_1fr] gap-4 border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="text-sm text-purple-300">{item.step}</div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 py-16 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
              Browser extension direction
            </p>

            <h2 className="mt-3 text-4xl font-serif font-normal text-white">
              Eventually, analyze awards wherever you find them.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              The current beta is a web app. The long-term goal is a browser
              assistant that can sit on top of award tools, airline sites, and
              cash fare pages to help you make better redemption decisions.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-semibold text-white">Coming later</p>

            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>• AI extraction from award screenshots</p>
              <p>• Cash fare matching for redemption value</p>
              <p>• Browser extension workflow</p>
              <p>• Card recommendation and wallet optimization</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Vantara. Private beta.</p>
            <p>
              Vantara is not affiliated with airlines, banks, or loyalty
              programs.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}