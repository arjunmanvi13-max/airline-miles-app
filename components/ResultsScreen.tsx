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
    <div> <div className="transition-all duration-300"></div>
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
            Simulated Nonstop only
          </label>

          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
            {paidTravelers} paid traveler{paidTravelers === 1 ? "" : "s"} •{" "}
            {tripType}
          </div>
        </div>
      </div>

      {!isSearching && hasRealResults && (
  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 text-sm text-blue-900">
    Showing real cached award availability from Seats.aero. Cached data confirms
    award availability, but exact schedules, flight numbers, aircraft, layovers,
    and whether the route is nonstop are not guaranteed here. Confirm all details
    before transferring points.
  </div>
)}

      {!isSearching && hasOnlyPlaceholderResults && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 text-sm text-yellow-900">
    No real cached award options were found for this exact route and date.
    Simulated fallback results are shown for comparison only and are not
    bookable availability.
  </div>
)}

      {isSearching && (
  <div className="space-y-4">
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            Searching award availability
          </div>

          <div className="text-sm text-slate-500 mt-1">
            Checking cached award inventory, transfer partners, and routing
            options...
          </div>
        </div>

        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin" />
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full w-2/3 bg-slate-700 rounded-full animate-pulse" />
      </div>
    </div>

    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 w-full">
            <div className="h-6 bg-slate-200 rounded w-1/3" />

            <div className="h-4 bg-slate-100 rounded w-1/2" />

            <div className="flex gap-2 pt-2">
              <div className="h-8 w-24 bg-slate-100 rounded-full" />
              <div className="h-8 w-20 bg-slate-100 rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-20 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    ))}
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