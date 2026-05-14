import { FlightDeal } from "@/app/logic";

export default function SavedTrips({
  savedTrips,
  onRemoveSavedTrip,
}: {
  savedTrips: FlightDeal[];
  onRemoveSavedTrip: (index: number) => void;
}) {
  return (
    <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">Saved Trips</h2>

      <p className="text-sm text-slate-500 mt-1">
        Saved award options for comparison during beta testing.
      </p>

      {savedTrips.length === 0 ? (
        <div className="mt-5 bg-slate-50 rounded-xl p-5 text-slate-500">
          No saved trips yet. Save an option from the Results screen to compare it later.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {savedTrips.map((deal, index) => (
            <div
              key={`${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`}
              className="border border-slate-200 rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{deal.airline}</p>

                  <p className="text-sm text-slate-500">
                    {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
                  </p>

                  <p className="text-sm text-slate-700 mt-1">
                    {deal.miles.toLocaleString()} miles • ${deal.taxes.toFixed(2)} taxes
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Saved locally on this browser
                  </p>
                </div>

                <button
                  onClick={() => onRemoveSavedTrip(index)}
                  className="text-sm font-semibold text-red-700 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}