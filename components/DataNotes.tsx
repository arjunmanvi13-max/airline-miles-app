export default function DataNotes() {
  return (
    <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">Data Notes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-900">Real data included</p>
          <p className="text-sm text-green-800 mt-1">
            Real airport database, structured transfer-ratio tables, and cached
            Seats.aero award availability when available.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-semibold text-yellow-900">
            Cached-data limitation
          </p>
          <p className="text-sm text-yellow-800 mt-1">
            Vantara currently uses Seats.aero cached award availability. Some
            routes or dates may not return real results if they have not
            recently been indexed. In those cases, simulated results are shown
            for comparison only.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-semibold text-blue-900">
            Live-search limitation
          </p>
          <p className="text-sm text-blue-800 mt-1">
            Live award search is not available through the current Pro API tier.
            Real results come from cached award data, while full live search
            would require a commercial Seats.aero agreement.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="font-semibold text-purple-900">Booking warning</p>
          <p className="text-sm text-purple-800 mt-1">
            Always verify award space before transferring points. Point
            transfers are often irreversible.
          </p>
        </div>
      </div>
    </div>
  );
}