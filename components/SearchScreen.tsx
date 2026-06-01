import { cardEcosystems } from "@/app/data";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import CalendarInput from "@/components/CalendarInput";
import TravelerCounter from "@/components/TravelerCounter";

type TripType = "Round trip" | "One way" | "Multi-city";
type Cabin = "Economy" | "Premium Economy" | "Business" | "First";
type PointBalances = Record<string, string>;

const feedbackFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSfevx7WkSwVD8wqhgji3rGlcaUeN-s5ha9ksNBt5QhRmmc-Gg/viewform?usp=dialog";

export default function SearchScreen({
  tripType,
  setTripType,
  from,
  setFrom,
  to,
  setTo,
  departureDate,
  setDepartureDate,
  returnDate,
  setReturnDate,
  cabin,
  setCabin,
  adults,
  setAdults,
  children,
  setChildren,
  infantsInSeat,
  setInfantsInSeat,
  infantsOnLap,
  setInfantsOnLap,
  flexibleDates,
  setFlexibleDates,
  includeNearbyAirports,
  setIncludeNearbyAirports,
  applyTransferBonuses,
  setApplyTransferBonuses,
  isSearching,
  handleSearch,
  selectedCards,
  pointBalances,
  onEditWallet,
}: {
  tripType: TripType;
  setTripType: (value: TripType) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  departureDate: string;
  setDepartureDate: (value: string) => void;
  returnDate: string;
  setReturnDate: (value: string) => void;
  cabin: string;
  setCabin: (value: string) => void;
  adults: number;
  setAdults: (value: number) => void;
  children: number;
  setChildren: (value: number) => void;
  infantsInSeat: number;
  setInfantsInSeat: (value: number) => void;
  infantsOnLap: number;
  setInfantsOnLap: (value: number) => void;
  flexibleDates: boolean;
  setFlexibleDates: (value: boolean) => void;
  includeNearbyAirports: boolean;
  setIncludeNearbyAirports: (value: boolean) => void;
  applyTransferBonuses: boolean;
  setApplyTransferBonuses: (value: boolean) => void;
  isSearching: boolean;
  handleSearch: () => void;
  selectedCards: string[];
  pointBalances: PointBalances;
  onEditWallet: () => void;
}) {
  const selectedCardText =
    selectedCards.length > 0 ? selectedCards.join(", ") : "No wallet selected";

  const walletSummary = cardEcosystems
    .filter((ecosystem) => selectedCards.includes(ecosystem.name))
    .map((ecosystem) => ({
      name: ecosystem.name,
      balance: pointBalances[ecosystem.name],
      pointsName: ecosystem.pointsName,
      logoPath: "logoPath" in ecosystem ? ecosystem.logoPath : "",
    }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
      <section className="border border-white/10 bg-[#090B12]/95 p-5 md:p-8 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-purple-300">
              Search console
            </p>

            <h2 className="mt-3 text-4xl md:text-5xl font-serif font-normal tracking-tight text-white">
              Where are you going?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Search cached award availability, expanded nearby airports, and
              wallet-aware transfer paths.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            Beta search
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.7fr_1fr]">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
              Trip type
            </label>

            <div className="grid grid-cols-2 border border-white/10 bg-[#111111]">
              {(["Round trip", "One way"] as TripType[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTripType(item)}
                  className={`p-4 text-left text-sm transition ${
                    tripType === item
                      ? "bg-purple-500/20 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
              Cabin
            </label>

            <div className="grid grid-cols-4 border border-white/10 bg-[#111111]">
              {(["Economy", "Premium Economy", "Business", "First"] as Cabin[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCabin(item)}
                    className={`border-r border-white/10 px-3 py-4 text-center text-xs font-semibold transition last:border-r-0 ${
                      cabin === item
                        ? "bg-purple-500/20 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AirportAutocomplete
            label="From"
            selectedAirport={from}
            onSelect={setFrom}
          />

          <AirportAutocomplete
            label="To"
            selectedAirport={to}
            onSelect={setTo}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <CalendarInput
            label="Departure date"
            value={departureDate}
            comparisonDate={returnDate}
            onChange={setDepartureDate}
          />

          {tripType === "Round trip" && (
            <CalendarInput
              label="Return date"
              value={returnDate}
              comparisonDate={departureDate}
              onChange={setReturnDate}
            />
          )}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Travelers
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TravelerCounter
              label="Adults"
              value={adults}
              onChange={setAdults}
              min={1}
            />
            <TravelerCounter
              label="Children"
              sublabel="Ages 2-11"
              value={children}
              onChange={setChildren}
            />
            <TravelerCounter
              label="Infants"
              sublabel="In seat"
              value={infantsInSeat}
              onChange={setInfantsInSeat}
            />
            <TravelerCounter
              label="Infants"
              sublabel="On lap"
              value={infantsOnLap}
              onChange={setInfantsOnLap}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 md:grid-cols-3">
          {[
            {
              label: "Flexible dates",
              description: "Search within nearby travel dates",
              checked: flexibleDates,
              onChange: setFlexibleDates,
            },
            {
              label: "Nearby airports",
              description: "Expand geographically when useful",
              checked: includeNearbyAirports,
              onChange: setIncludeNearbyAirports,
            },
            {
              label: "Transfer bonuses",
              description: "Apply prototype bonus logic",
              checked: applyTransferBonuses,
              onChange: setApplyTransferBonuses,
            },
          ].map((item) => (
            <label
              key={item.label}
              className={`border p-4 transition ${
                item.checked
                  ? "border-purple-300/70 bg-purple-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="h-4 w-4 accent-purple-500"
                />
              </div>
            </label>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.35fr]">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="border border-purple-300/50 bg-purple-500/15 p-4 font-semibold text-purple-100 transition hover:bg-purple-500/25 disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search award availability"}
            </button>

            <a
              href="/"
              className="border border-white/10 bg-white/[0.04] p-4 text-center font-semibold text-white hover:bg-white/[0.08]"
            >
              Home
            </a>
          </div>

          <a
            href={feedbackFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-purple-300/40 bg-purple-500/10 p-4 text-center font-semibold text-purple-100 hover:bg-purple-500/20"
          >
            Leave feedback about the beta
          </a>
        </div>
      </section>

      <aside className="border border-white/10 bg-[#0B0D14]/90 p-5 md:p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] uppercase tracking-[0.32em] text-purple-300">
          Wallet context
        </p>

        <h2 className="mt-3 text-3xl font-serif font-normal text-white">
          Your points shape the search.
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Vantara ranks options using the ecosystems you selected and the
          balances you provide.
        </p>

        <div className="mt-6 border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Using
          </p>
          <p className="mt-2 font-semibold text-white">{selectedCardText}</p>
        </div>

        <div className="mt-4 space-y-3">
          {walletSummary.length > 0 ? (
            walletSummary.map((item) => (
              <div
                key={item.name}
                className="border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center gap-3">
                  {item.logoPath && (
                    <div className="flex h-10 w-10 items-center justify-center bg-white">
                      <img
                        src={item.logoPath}
                        alt=""
                        className="h-7 w-7 object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.pointsName}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  Balance:{" "}
                  <span className="font-semibold text-white">
                    {item.balance ? item.balance : "Not entered"}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
              No card ecosystems selected yet.
            </p>
          )}
        </div>

        <button
          onClick={onEditWallet}
          className="mt-5 w-full border border-purple-300/40 bg-purple-500/10 p-4 font-semibold text-purple-100 hover:bg-purple-500/20"
        >
          Edit Wallet
        </button>
      </aside>
    </div>
  );
}