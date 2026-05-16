import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">Vantara</p>
            <p className="text-xs text-slate-400">Private beta</p>
          </div>

          <Link
            href="/app"
            className="rounded-full bg-white text-slate-950 px-5 py-2 text-sm font-semibold hover:bg-slate-200"
          >
            Open app
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-20">
          <div>
            <div className="inline-flex rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm text-purple-200 mb-6">
              Award search built around your points wallet
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Find the smartest way to book flights with points.
            </h1>

            <p className="text-lg text-slate-300 mt-6 leading-8">
              Vantara helps travelers compare real award availability, transfer
              partners, taxes, seat counts, itinerary details, and booking
              strategies across transferable credit card ecosystems.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/app"
                className="rounded-xl bg-purple-600 px-6 py-4 text-center font-semibold hover:bg-purple-700"
              >
                Try the beta app
              </Link>

              <a
  href="#feedback"
  className="rounded-xl border border-slate-600 px-6 py-4 text-center font-semibold hover:bg-slate-900"
>
  Leave feedback
</a>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Private beta: award availability should always be confirmed before
              transferring points.
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="bg-white text-slate-900 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-xl">JFK → LHR</p>
                  <p className="text-sm text-slate-500">
                    Business • Real itinerary • 2 seats left
                  </p>
                </div>

                <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                  Real award
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-purple-700">Points</p>
                  <p className="font-bold text-purple-900">57,500</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Taxes</p>
                  <p className="font-bold">$5.60</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Cash</p>
                  <p className="font-bold text-slate-500">N/A</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mt-5">
                <p className="font-semibold text-purple-900">
                  Best booking strategy
                </p>
                <p className="text-sm text-purple-800 mt-1">
                  Transfer Chase points → United MileagePlus®
                </p>
              </div>

              <div className="border-t border-slate-200 mt-5 pt-4 text-sm text-slate-600">
                <p>UA 934 • Boeing 767-300 • 7h 10m</p>
                <p className="mt-1">Availability may change before booking.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
          {[
            {
              title: "Real award data",
              body: "Use cached award availability, itinerary details, taxes, and seat counts when available.",
            },
            {
              title: "Wallet-aware strategy",
              body: "Prioritize options based on your transferable points ecosystems and balances.",
            },
            {
              title: "Cleaner decisions",
              body: "See which program to book with, what to transfer, and what still needs confirmation.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="font-bold text-lg">{item.title}</p>
              <p className="text-sm text-slate-300 mt-2 leading-6">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="pb-16">
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
    <div className="max-w-3xl">
      <p className="text-sm font-semibold text-purple-300">
        What should I test?
      </p>

      <h2 className="text-3xl font-bold mt-3">
        Help stress-test real award search workflows.
      </h2>

      <p className="text-slate-300 mt-4 leading-7">
        The current beta is focused on helping travelers evaluate transferable
        points redemptions more confidently. Try routes you would actually book
        and look for anything confusing, inaccurate, or missing.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {[
        "Compare a US domestic route you already know well",
        "Try an international redemption with transfer partners",
        "Test different card ecosystems and balances",
        "Compare multiple booking paths for the same trip",
        "Look for confusing terminology or unclear recommendations",
        "Check whether the booking strategy feels trustworthy",
      ].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-slate-200"
        >
          {item}
        </div>
      ))}
    </div>
  </div>
</section>

        <section
          id="feedback"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start border-t border-white/10 py-16"
        >
          <div>
            <p className="text-sm text-purple-300 font-semibold">
              Leave beta feedback
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Help improve Vantara before the next beta build.
            </h2>

            <p className="text-slate-300 mt-4 leading-7">
              Try the app, search a real route, and share what felt useful, confusing, or missing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="font-semibold">Best for</p>
                <p className="text-sm text-slate-400 mt-1">
                  Travelers with Amex, Chase, Capital One, Bilt, Citi, or Wells
                  Fargo points.
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="font-semibold">Beta focus</p>
                <p className="text-sm text-slate-400 mt-1">
                  Award availability, transfer logic, result trust, and booking
                  strategy clarity.
                </p>
              </div>
            </div>
          </div>

          <form
  action="mailto:vantara747@gmail.com?subject=Vantara Beta Feedback"
  method="post"
  encType="text/plain"
  className="rounded-3xl bg-white text-slate-900 p-6 shadow-2xl"
>
            <p className="font-bold text-xl">Share feedback</p>

            <p className="text-sm text-slate-500 mt-1">
              This temporary feedback form opens your email app with your notes.
A database-backed feedback form can be added next.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  name="Email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Feedback/Notes
                </label>
                <input
                  name="Feedback Notes"
                  type="text"
                  placeholder="What can we improve?"
                  className="mt-2 w-full border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Main points ecosystem
                </label>
                <select
                  name="Main points ecosystem"
                  className="mt-2 w-full border border-slate-300 rounded-xl p-3 bg-white text-slate-900"
                >
                  <option>Amex</option>
                  <option>Chase</option>
                  <option>Capital One</option>
                  <option>Bilt</option>
                  <option>Citi</option>
                  <option>Wells Fargo</option>
                  <option>Multiple ecosystems</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-700 text-white p-4 font-semibold hover:bg-purple-800"
              >
                Send feedback
              </button>
            </div>
          </form>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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