import { useEffect, useState } from "react";
import { FlightDealWithSource } from "@/app/adapters";

type SortMode =
  | "Best overall"
  | "Lowest points"
  | "Lowest taxes"
  | "Lowest cash price"
  | "Nonstop first";

const feedbackFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSfevx7WkSwVD8wqhgji3rGlcaUeN-s5ha9ksNBt5QhRmmc-Gg/viewform?usp=dialog";

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
  const searchSteps = [
    "Searching cached award availability...",
    "Expanding nearby airport options...",
    "Comparing transfer partner paths...",
    "Enriching itinerary details...",
    "Ranking bookable options...",
  ];

  const [searchStepIndex, setSearchStepIndex] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setSearchStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setSearchStepIndex((current) =>
        current < searchSteps.length - 1 ? current + 1 : current
      );
    }, 900);

    return () => clearInterval(interval);
  }, [isSearching]);

  return (
    <div>
      <div className="mb-6 border border-white/10 bg-[#090B12]/95 p-5 md:p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
              Award results
            </p>

            <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
              Search results
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Bookable results appear first. Blank point balances are treated as
              unknown, not zero.
            </p>
          </div>

          <button
            onClick={onEditSearch}
            className="border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
          >
            Edit Search
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{
  backgroundColor: "#111111",
  color: "white",
}}
className="border border-white/10 p-4 text-sm outline-none transition hover:border-white/20 focus:border-purple-300"
          >
            <option value="Best overall">Best overall</option>
            <option value="Lowest points">Lowest points</option>
            <option value="Lowest taxes">Lowest taxes</option>
            <option value="Lowest cash price">Lowest cash price</option>
            <option value="Nonstop first">Nonstop first</option>
          </select>

          <label
            className={`flex items-center justify-between gap-3 border p-4 text-sm transition ${
              nonstopOnly
                ? "border-purple-300/60 bg-purple-500/10 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-400"
            }`}
          >
            <span>Nonstop only</span>
            <input
              type="checkbox"
              checked={nonstopOnly}
              onChange={(e) => setNonstopOnly(e.target.checked)}
              className="h-4 w-4 accent-purple-500"
            />
          </label>

          <div className="border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            {paidTravelers} paid traveler{paidTravelers === 1 ? "" : "s"} •{" "}
            {tripType}
          </div>
        </div>
      </div>

      {!isSearching && hasRealResults && (
        <div className="mb-4 border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Showing real cached award availability. Some results include enriched
          itinerary details such as segments, aircraft, flight numbers, and seat
          counts. Always confirm final availability before transferring points.
        </div>
      )}

      {!isSearching && hasOnlyPlaceholderResults && (
        <div className="mb-4 border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
          No cached award options were found for this route, nearby expansion,
          and date. Try flexible dates, a major hub, or a different cabin.
        </div>
      )}

      {isSearching && (
        <div className="space-y-4">
          <div className="border border-white/10 bg-[#090B12] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white">
                  {searchSteps[searchStepIndex]}
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  Vantara is checking award data, nearby airports, transfer
                  partners, and itinerary details.
                </div>
              </div>

              <div className="h-8 w-8 animate-spin border-4 border-white/10 border-t-purple-300" />
            </div>

            <div className="h-2 w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-purple-400 transition-all duration-500"
                style={{
                  width: `${((searchStepIndex + 1) / searchSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse border border-white/10 bg-[#090B12] p-6"
            >
              <div className="space-y-4">
                <div className="h-6 w-1/3 bg-white/10" />
                <div className="h-4 w-1/2 bg-white/5" />
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="h-20 bg-white/5" />
                  <div className="h-20 bg-white/5" />
                  <div className="h-20 bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSearching && displayedResults.length === 0 && (
        <div className="border border-white/10 bg-[#090B12] p-6 text-slate-300">
          <p className="font-semibold text-white">No results to show yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            Try starting a search, changing dates, choosing a different cabin,
            or turning off the nonstop-only filter.
          </p>

          <button
            onClick={onEditSearch}
            className="mt-4 border border-purple-300/40 bg-purple-500/10 px-4 py-3 font-semibold text-purple-100 hover:bg-purple-500/20"
          >
            Edit Search
          </button>
        </div>
      )}

      {!isSearching &&
        displayedResults.map((deal, index) => renderResultCard(deal, index))}

      {!isSearching && displayedResults.length > 0 && (
        <div className="mt-6 border border-white/10 bg-[#090B12] p-5 text-slate-300">
          <p className="font-semibold text-white">
            Was anything confusing or inaccurate?
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Your feedback helps improve Vantara’s routing, transfer logic, and
            result clarity.
          </p>

          <a
            href={feedbackFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border border-purple-300/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 hover:bg-purple-500/20"
          >
            Send feedback on these results
          </a>
        </div>
      )}
    </div>
  );
}