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
        Saved award options for comparison.
      </p>

      {savedTrips.length === 0 ? (
        <div className="mt-5 bg-slate-50 rounded-xl p-5 text-slate-500">
          No saved trips yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {savedTrips.map((deal, index) => (
            <div
              key={`${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`}
              className="border rounded-xl p-4"
            >
              <p className="font-bold">{deal.airline}</p>

              <p className="text-sm text-slate-500">
                {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
              </p>

              <p className="text-sm text-slate-700 mt-1">
                {deal.miles.toLocaleString()} miles • ${deal.taxes.toFixed(2)}{" "}
                taxes
              </p>

              <button
                onClick={() => onRemoveSavedTrip(index)}
                className="mt-3 text-sm font-semibold text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}