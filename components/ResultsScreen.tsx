import { FlightDealWithSource } from "@/app/adapters";

type SortMode =
  | "Best overall"
  | "Lowest points"
  | "Lowest taxes"
  | "Lowest cash price"
  | "Nonstop first";

export default function ResultsScreen({
  paidTravelers,
  tripType,
  sortMode,
  setSortMode,
  nonstopOnly,
  setNonstopOnly,
  isSearching,
  hasRealResults,
  hasOnlyPlaceholderResults,
  displayedResults,
  renderResultCard,
  onEditSearch,
}: {
  paidTravelers: number;
  tripType: string;
  sortMode: SortMode;
  setSortMode: (value: SortMode) => void;
  nonstopOnly: boolean;
  setNonstopOnly: (value: boolean) => void;
  isSearching: boolean;
  hasRealResults: boolean;
  hasOnlyPlaceholderResults: boolean;
  displayedResults: FlightDealWithSource[];
  renderResultCard: (deal: FlightDealWithSource, index: number) => React.ReactNode;
  onEditSearch: () => void;
}) {
  return (
    <div>
      <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Results</h2>
            <p className="text-sm text-slate-500">
              Bookable results appear first. Blank point balances are treated as
              unknown, not zero.
            </p>
          </div>

          <button
            onClick={onEditSearch}
            className="border border-slate-300 rounded-xl px-4 py-3 font-semibold"
          >
            Edit Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="border border-slate-300 p-3 rounded-xl bg-white"
          >
            <option value="Best overall">Best overall</option>
            <option value="Lowest points">Lowest points</option>
            <option value="Lowest taxes">Lowest taxes</option>
            <option value="Lowest cash price">Lowest cash price</option>
            <option value="Nonstop first">Nonstop first</option>
          </select>

          <label className="flex items-center gap-2 border border-slate-300 rounded-xl p-3 text-sm">
            <input
              type="checkbox"
              checked={nonstopOnly}
              onChange={(e) => setNonstopOnly(e.target.checked)}
            />
            Nonstop only
          </label>

          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
            {paidTravelers} paid traveler{paidTravelers === 1 ? "" : "s"} •{" "}
            {tripType}
          </div>
        </div>
      </div>

      {!isSearching && hasRealResults && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-sm text-green-900">
          Showing real cached award availability from Seats.aero. Exact
          itinerary details are not included yet, so confirm schedules and stops
          before transferring points.
        </div>
      )}

      {!isSearching && hasOnlyPlaceholderResults && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 text-sm text-yellow-900">
          No real cached award options were found for this exact route and date.
          Simulated results are shown so you can still compare transfer
          partners, point costs, and wallet logic.
        </div>
      )}

      {isSearching && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-500">
          Searching award availability...
        </div>
      )}

      {!isSearching && displayedResults.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-500">
          No results yet. Start from the Search screen.
        </div>
      )}

      {!isSearching &&
        displayedResults.map((deal, index) => renderResultCard(deal, index))}
    </div>
  );
}