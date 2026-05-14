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
                href="#waitlist"
                className="rounded-xl border border-slate-600 px-6 py-4 text-center font-semibold hover:bg-slate-900"
              >
                Join beta waitlist
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

        <section
          id="waitlist"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start border-t border-white/10 py-16"
        >
          <div>
            <p className="text-sm text-purple-300 font-semibold">
              Join the private beta
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Help shape the points search engine built for real travelers.
            </h2>

            <p className="text-slate-300 mt-4 leading-7">
              Beta testers will help validate routes, booking strategies,
              wallet recommendations, and which features should come next.
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
  action="mailto:hello@vantara.app?subject=Vantara Beta Request"
  method="post"
  encType="text/plain"
  className="rounded-3xl bg-white text-slate-900 p-6 shadow-2xl"
>
            <p className="font-bold text-xl">Request beta access</p>

            <p className="text-sm text-slate-500 mt-1">
              This temporary beta form opens your email app. A database-backed
              waitlist can be added next.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Home airport
                </label>
                <input
                  name="homeAirport"
                  type="text"
                  placeholder="JFK, LAX, ATL..."
                  className="mt-2 w-full border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Main points ecosystem
                </label>
                <select
                  name="pointsEcosystem"
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
                Join beta waitlist
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