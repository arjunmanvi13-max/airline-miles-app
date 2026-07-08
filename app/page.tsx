import Link from "next/link";

const chromeStoreUrl = "https://chromewebstore.google.com/detail/fgihdiegnhkhkdbianlokkbkfddkgkid?utm_source=item-share-cb"; // replace with your Chrome Web Store URL once live

const supportedSites = [
  {
    name: "Seats.aero",
    status: "Live",
    href: "https://seats.aero",
    description: "Analyze expanded award cards with one click.",
    active: true,
  },
  {
    name: "PointsYeah",
    status: "Coming soon",
    href: "",
    description: "Embedded award analysis is planned next.",
    active: false,
  },
  {
    name: "Roame",
    status: "Coming soon",
    href: "",
    description: "Support is planned after launch.",
    active: false,
  },
  {
    name: "Point.me",
    status: "Coming soon",
    href: "",
    description: "Support is planned after launch.",
    active: false,
  },
];

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

          <a
            href={chromeStoreUrl}
            className="border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
          >
            Get Extension
          </a>
        </nav>

        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex border border-purple-300/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
              Now live on Seats.aero
            </div>

            <h1 className="max-w-4xl text-5xl font-serif font-normal tracking-tight text-white md:text-7xl">
              Know if an award is worth booking before you transfer points.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Vantara adds a decision layer directly onto award search sites.
              Build your points wallet once, open Seats.aero, and click ✦
              Vantara on an award to see value, wallet fit, transfer path, and
              whether you should book with points or pay cash.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={chromeStoreUrl}
                className="bg-white px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-purple-100"
              >
                Get Chrome Extension
              </a>

              <a
                href="https://seats.aero"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 bg-white/[0.04] px-6 py-4 text-center font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Open Seats.aero
              </a>
            </div>

            <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500">
              Always verify award availability before transferring points.
              Transfers are often irreversible.
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
                <p className="text-xs text-slate-500">Redemption score</p>
                <p className="mt-2 font-semibold text-white">86/100</p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Value</p>
                <p className="mt-2 font-semibold text-white">2.6¢ / point</p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Best transfer</p>
                <p className="mt-2 font-semibold text-white">
                  Amex → Flying Club
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Bookability</p>
                <p className="mt-2 font-semibold text-white">Valid</p>
              </div>
            </div>

            <div className="mt-4 border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">
                What Vantara checks
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>• Live cash fare comparison</p>
                <p>• Cents-per-point value</p>
                <p>• Best transfer path</p>
                <p>• Wallet fit and point shortage</p>
                <p>• Book, compare, or pay cash recommendation</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
              How Vantara works
            </p>

            <h2 className="mt-3 text-4xl font-serif font-normal text-white">
              The flow is simple.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Build your wallet",
                body: "Add your transferable points programs and optional balances.",
              },
              {
                step: "02",
                title: "Search Seats.aero",
                body: "Find award availability the way you normally would.",
              },
              {
                step: "03",
                title: "Click ✦ Vantara",
                body: "Open an award card and run analysis directly on the result.",
              },
              {
                step: "04",
                title: "Get the decision",
                body: "See whether to book with points, compare, or pay cash.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-sm text-purple-300">{item.step}</p>
                <p className="mt-4 text-lg font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
                Supported award sites
              </p>

              <h2 className="mt-3 text-4xl font-serif font-normal text-white">
                Start on the sites you already use.
              </h2>
            </div>

            <a
              href={chromeStoreUrl}
              className="border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-center text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
            >
              Install Extension
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {supportedSites.map((site) => {
              const content = (
                <div
                  className={`h-full border p-6 transition ${
                    site.active
                      ? "border-purple-300/30 bg-purple-500/10 hover:bg-purple-500/15"
                      : "border-white/10 bg-white/[0.025] opacity-45"
                  }`}
                >
                  <div className="flex min-h-28 items-center justify-center border border-white/10 bg-black/20">
                    <p className="text-2xl font-serif text-white">
                      {site.name}
                    </p>
                  </div>

                  <p
                    className={`mt-5 inline-flex px-3 py-1 text-xs font-semibold ${
                      site.active
                        ? "bg-green-500/10 text-green-300"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {site.status}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {site.description}
                  </p>
                </div>
              );

              return site.active ? (
                <a
                  key={site.name}
                  href={site.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={site.name}>{content}</div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
              Why it matters
            </p>

            <h2 className="mt-3 text-4xl font-serif font-normal text-white">
              Award space is only half the decision.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Finding an award seat does not automatically mean it is a good
              redemption. Vantara helps you judge the booking before you move
              points into an airline program.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              "Is this redemption actually valuable?",
              "Is the cash price low enough that I should pay cash instead?",
              "Which transferable points program should I use?",
              "Do I have enough points to book this?",
              "Is this worth transferring points for right now?",
            ].map((question) => (
              <div
                key={question}
                className="border border-white/10 bg-white/[0.03] p-5 text-sm font-semibold text-white"
              >
                {question}
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
            Ready to analyze your next award?
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-serif font-normal text-white">
            Install Vantara, build your wallet, and click ✦ Analyze on
            Seats.aero.
          </h2>

          <div className="mt-8">
            <a
              href={chromeStoreUrl}
              className="inline-flex bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-purple-100"
            >
              Get Chrome Extension
            </a>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Vantara.</p>
            <p>
              Vantara is not affiliated with airlines, banks, award search
              tools, or loyalty programs.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}