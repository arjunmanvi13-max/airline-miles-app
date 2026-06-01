export default function DataNotes() {
  return (
    <div className="border border-white/10 bg-[#090B12]/95 p-5 md:p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
        Trust layer
      </p>

      <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
        Data notes
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
        Vantara is built around trust. These notes explain what is real, what is
        cached, and what still requires confirmation before booking.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border border-emerald-300/25 bg-emerald-500/10 p-4">
          <p className="font-semibold text-emerald-100">Real data included</p>
          <p className="mt-2 text-sm leading-6 text-emerald-100/75">
            Real airport database, structured transfer-ratio tables, and cached
            award availability when available.
          </p>
        </div>

        <div className="border border-amber-300/25 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-100">Cached-data limitation</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/75">
            Vantara currently uses cached award availability. Some routes or
            dates may not return real results if they have not recently been
            indexed.
          </p>
        </div>

        <div className="border border-blue-300/25 bg-blue-500/10 p-4">
          <p className="font-semibold text-blue-100">Live-search limitation</p>
          <p className="mt-2 text-sm leading-6 text-blue-100/75">
            Live award search is not available through the current beta data
            setup. Future infrastructure will require Vantara-owned live search
            and caching.
          </p>
        </div>

        <div className="border border-purple-300/25 bg-purple-500/10 p-4">
          <p className="font-semibold text-purple-100">Booking warning</p>
          <p className="mt-2 text-sm leading-6 text-purple-100/75">
            Always verify award space before transferring points. Point
            transfers are often irreversible.
          </p>
        </div>
      </div>
    </div>
  );
}