import { cardEcosystems } from "@/app/data";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import CalendarInput from "@/components/CalendarInput";
import TravelerCounter from "@/components/TravelerCounter";

type TripType = "Round trip" | "One way" | "Multi-city";
type PointBalances = Record<string, string>;

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
    selectedCards.length > 0 ? selectedCards.join(", ") : "No cards selected";

  const walletSummary = cardEcosystems
    .filter((ecosystem) => selectedCards.includes(ecosystem.name))
    .map((ecosystem) => ({
      name: ecosystem.name,
      balance: pointBalances[ecosystem.name],
      pointsName: ecosystem.pointsName,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white shadow-xl rounded-3xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          Search trip
        </h2>

        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-900">
            Searches use cached award availability
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Vantara shows real award results when recently indexed Seats.aero
            cached data is available. If no cached award data exists for a route
            or date, simulated options may appear so you can still test point
            and transfer logic.
          </p>
        </div>

        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value as TripType)}
          className="border border-slate-300 p-3 rounded-xl w-full bg-white"
        >
          <option value="Round trip">Round trip</option>
          <option value="One way">One way</option>
          <option value="Multi-city" disabled>
            Multi-city coming in API phase
          </option>
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CalendarInput
            label="Departure date"
            value={departureDate}
            onChange={setDepartureDate}
          />

          {tripType === "Round trip" && (
            <CalendarInput
              label="Return date"
              value={returnDate}
              onChange={setReturnDate}
            />
          )}
        </div>

        <select
          value={cabin}
          onChange={(e) => setCabin(e.target.value)}
          className="border border-slate-300 p-3 rounded-xl w-full mt-4 bg-white"
        >
          <option value="Economy">Economy</option>
          <option value="Premium Economy">Premium Economy</option>
          <option value="Business">Business</option>
          <option value="First">First</option>
        </select>

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Travelers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4
          ">
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

        <label className="flex items-center gap-2 mt-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={flexibleDates}
            onChange={(e) => setFlexibleDates(e.target.checked)}
          />
          Flexible dates: show deals within 2 days
        </label>

        <label className="flex items-center gap-2 mt-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={includeNearbyAirports}
            onChange={(e) => setIncludeNearbyAirports(e.target.checked)}
          />
          Include nearby airports
        </label>

        <label className="flex items-center gap-2 mt-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={applyTransferBonuses}
            onChange={(e) => setApplyTransferBonuses(e.target.checked)}
          />
          Apply prototype transfer bonuses when available
        </label>

        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-6 border-t border-slate-200 md:static md:border-0 md:p-0">
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <button
      onClick={handleSearch}
      disabled={isSearching}
      className="sm:col-span-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold p-4 rounded-xl disabled:opacity-60"
    >
      {isSearching ? "Searching..." : "Search Best Miles Deals"}
    </button>

    <a
      href="/"
      className="border border-slate-300 rounded-xl p-4 text-center font-semibold hover:bg-slate-50"
    >
      Home
    </a>
  </div>

  <a
    href="https://docs.google.com/forms/d/e/1FAIpQLSfevx7WkSwVD8wqhgji3rGlcaUeN-s5ha9ksNBt5QhRmmc-Gg/viewform?usp=dialog"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 block w-full border border-purple-300 bg-purple-50 text-purple-900 rounded-xl p-4 text-center font-semibold hover:bg-purple-100"
  >
    Leave feedback about the beta
  </a>
</div>
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-4 md:p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">My wallet</h2>
        <p className="text-sm text-slate-500 mt-1">
          Results will prioritize flights you can afford with your points.
        </p>

        <div className="mt-4 space-y-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Using</p>
            <p className="font-semibold text-slate-900">{selectedCardText}</p>
          </div>

          {walletSummary.length > 0 ? (
            walletSummary.map((item) => (
              <div key={item.name} className="border rounded-xl p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">{item.pointsName}</p>
                <p className="text-sm mt-1">
                  Balance:{" "}
                  <span className="font-semibold">
                    {item.balance ? item.balance : "Not entered"}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No cards selected.</p>
          )}

          <button
            onClick={onEditWallet}
            className="w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
          >
            Edit Wallet
          </button>
        </div>
      </div>
    </div>
  );
}