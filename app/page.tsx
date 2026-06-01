import Link from "next/link";
import CalculatorScreen from "@/components/CalculatorScreen";

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
            <p className="text-[11px] uppercase tracking-[0.45em] text-purple-300">
              Award travel intelligence
            </p>

            <p className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
              Vantara
            </p>
          </div>

          <Link
            href="/app"
            className="border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
          >
            Open app
          </Link>
        </nav>

        <section className="grid grid-cols-1 gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              Private beta
            </div>

            <h1 className="max-w-4xl text-5xl font-serif font-normal tracking-tight text-white md:text-7xl">
              Smarter award travel starts with your wallet.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Vantara helps travelers compare award availability, transferable
              points strategy, taxes, routing options, and booking confidence
              across major credit card ecosystems.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/app"
                className="border border-purple-300/50 bg-purple-500/15 px-6 py-4 text-center font-semibold text-purple-100 transition hover:bg-purple-500/25"
              >
                Try award search
              </Link>

              <Link
                href="/app"
                className="border border-white/10 bg-white/[0.04] px-6 py-4 text-center font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Use calculator
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

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Private beta: always confirm award space before transferring
              points. Point transfers are often irreversible.
            </p>
          </div>

          <div className="border border-white/10 bg-[#090B12]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <div className="border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-purple-300">
                    Example strategy
                  </p>

                  <p className="mt-3 text-3xl font-serif font-normal text-white">
                    JFK → LHR
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Business • 2 seats • cached award result
                  </p>
                </div>

                <span className="border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Real award
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="border border-purple-300/25 bg-purple-500/10 p-4">
                  <p className="text-xs text-purple-200/80">Points</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    57,500
                  </p>
                </div>

                <div className="border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">Taxes</p>
                  <p className="mt-1 text-xl font-semibold text-white">$5.60</p>
                </div>

                <div className="border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">Cash</p>
                  <p className="mt-1 text-xl font-semibold text-slate-400">
                    N/A
                  </p>
                </div>
              </div>

              <div className="mt-5 border border-purple-300/25 bg-purple-500/10 p-4">
                <p className="font-semibold text-purple-100">
                  Best booking strategy
                </p>

                <p className="mt-2 text-sm leading-6 text-purple-100/75">
                  Transfer Chase points → United MileagePlus® and confirm final
                  award space before moving points.
                </p>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4 text-sm leading-7 text-slate-400">
                <p>UA 934 • Boeing 767-300 • 7h 10m</p>
                <p>Availability may change before booking.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-3">
          {[
            {
              title: "Search when data exists",
              body: "Use cached award availability, itinerary details, taxes, and seat counts when available.",
            },
            {
              title: "Calculate anytime",
              body: "Already found a flight elsewhere? Use Vantara to evaluate the best transfer path.",
            },
            {
              title: "Book with confidence",
              body: "See which program to book with, what to transfer, and what still needs confirmation.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-white/10 bg-white/[0.035] p-5"
            >
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="border-y border-white/10 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
                What to test
              </p>

              <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
                Help stress-test real award workflows.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                The current beta is focused on award search clarity, wallet-aware
                recommendations, and transfer strategy confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                "Compare a route you already know well",
                "Try an international redemption",
                "Test different card ecosystems",
                "Enter real point balances",
                "Look for confusing recommendations",
                "Check whether the strategy feels trustworthy",
              ].map((item) => (
                <div
                  key={item}
                  className="border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="feedback"
          className="grid grid-cols-1 gap-8 py-16 lg:grid-cols-2"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
              Beta feedback
            </p>

            <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
              Help improve Vantara with real-world testing.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              The most valuable feedback is about confusing booking paths,
              missing routes, unclear recommendations, and transfer strategy
              issues.
            </p>
          </div>

          <div className="border border-white/10 bg-[#090B12]/95 p-6">
            <p className="text-2xl font-serif font-normal text-white">
              Share feedback
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The beta feedback form takes about 2 minutes and helps shape
              future versions of Vantara.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Report confusing results",
                "Suggest missing features",
                "Share award search frustrations",
                "Test wallet recommendations",
                "Help improve booking confidence",
              ].map((item) => (
                <div
                  key={item}
                  className="border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>

            <a
              href={feedbackFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full border border-purple-300/40 bg-purple-500/10 p-4 text-center font-semibold text-purple-100 hover:bg-purple-500/20"
            >
              Open feedback form
            </a>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Vantara. Private beta.</p>
            <p>
              Vantara is not affiliated with airlines, banks, or loyalty
              programs. Award availability can change before booking.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}