"use client";

import { useEffect, useMemo, useState } from "react";
import { cardEcosystems } from "./data";
import {
  FlightDeal,
  getCentsPerMile,
  getDealLabel,
  getDealStyle,
  getRecommendation,
  getTransferOptions,
} from "./logic";


import { FlightDealWithSource, searchFlightDeals } from "./adapters";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import CalendarInput from "@/components/CalendarInput";
import TravelerCounter from "@/components/TravelerCounter";
import { getBrandStyle, getLogoInitials } from "@/components/BrandBadge";
import {
  getAwardDurationText,
  getAwardRouteTypeText,
  getAwardScheduleText,
} from "@/components/AwardText";
import DataNotes from "@/components/DataNotes";
import SavedTrips from "@/components/SavedTrips";
import WalletScreen from "@/components/WalletScreen";
import SearchScreen from "@/components/SearchScreen";


type View = "Search" | "Wallet" | "Results" | "Saved" | "Data";
type TripType = "Round trip" | "One way" | "Multi-city";
type PointBalances = Record<string, string>;
type SortMode =
  | "Best overall"
  | "Lowest points"
  | "Lowest taxes"
  | "Lowest cash price"
  | "Nonstop first";

  type ReturnPreview = {
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  stopCity?: string;
};

function parseDurationToHours(duration: string) {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  return hours + minutes / 60;
}

function formatTimeFromHour(hour: number) {
  const totalMinutes = Math.round(hour * 60);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const hours24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  const suffix = hours24 >= 12 ? "PM" : "AM";
  const displayHour = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function buildReturnPreview(deal: FlightDeal, returnDate: string): ReturnPreview {
  const durationHours = parseDurationToHours(deal.duration || "8h 00m");
  const departureHour = 9 + (deal.airline.length % 5) * 2;

  return {
    from: deal.to,
    to: deal.from,
    date: returnDate || deal.date,
    departureTime: formatTimeFromHour(departureHour),
    arrivalTime: formatTimeFromHour(departureHour + durationHours),
    duration: deal.duration || "Duration TBD",
    stops: deal.stops,
    stopCity: deal.stopCity,
  };
}

const defaultBalances: PointBalances = {
  Amex: "",
  Chase: "",
  "Capital One": "",
  Bilt: "",
  Citi: "",
  "Wells Fargo": "",
};







export default function Home() {
  
  const [expandedCardDatabases, setExpandedCardDatabases] = useState<string[]>([]);
  const [expandedDeals, setExpandedDeals] = useState<string[]>([]);
  const [view, setView] = useState<View>("Search");
  const [tripType, setTripType] = useState<TripType>("Round trip");
  const [cabin, setCabin] = useState("Economy");
  const [selectedCards, setSelectedCards] = useState<string[]>(["Amex"]);
  const [pointBalances, setPointBalances] =
    useState<PointBalances>(defaultBalances);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infantsInSeat, setInfantsInSeat] = useState(0);
  const [infantsOnLap, setInfantsOnLap] = useState(0);

  const [flexibleDates, setFlexibleDates] = useState(false);
  const [includeNearbyAirports, setIncludeNearbyAirports] = useState(true);
  const [applyTransferBonuses, setApplyTransferBonuses] = useState(true);

  const [results, setResults] = useState<FlightDealWithSource[]>([]);
  const [savedTrips, setSavedTrips] = useState<FlightDeal[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>("Best overall");
  const [nonstopOnly, setNonstopOnly] = useState(false);

  const paidTravelers = adults + children + infantsInSeat;
  const tripMultiplier = tripType === "Round trip" ? 2 : 1;
  const totalMultiplier = paidTravelers * tripMultiplier;

  const hasRealResults = results.some(
  (deal) => "dataSource" in deal && deal.dataSource === "seats_aero_cached"
);

const hasOnlyPlaceholderResults =
  results.length > 0 && results.every((deal) => deal.dataSource === "placeholder");
  

  const toggleExpandedDeal = (dealId: string) => {
  setExpandedDeals((current) =>
    current.includes(dealId)
      ? current.filter((id) => id !== dealId)
      : [...current, dealId]
  );
};

  useEffect(() => {
    const savedProfile = localStorage.getItem("airlineMilesProfile");
    const savedTripData = localStorage.getItem("savedTrips");

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setFrom(profile.homeAirport || "");
      setCabin(profile.preferredCabin || "Economy");
      setSelectedCards(profile.cards || ["Amex"]);
      setTripType(profile.tripType || "Round trip");
      setAdults(profile.adults || 1);
      setChildren(profile.children || 0);
      setInfantsInSeat(profile.infantsInSeat || 0);
      setInfantsOnLap(profile.infantsOnLap || 0);
      setPointBalances(profile.pointBalances || defaultBalances);
    }

    if (savedTripData) {
      setSavedTrips(JSON.parse(savedTripData));
    }
  }, []);

  const getNumericBalance = (card: string) => {
    const rawBalance = pointBalances[card];

    if (!rawBalance || rawBalance.trim() === "") return null;

    const numericValue = Number(rawBalance.replace(/,/g, ""));
    return Number.isNaN(numericValue) ? null : numericValue;
  };

  const getRankedTransferOptions = (deal: FlightDeal) => {
  const options = getTransferOptions(
    deal,
    selectedCards,
    applyTransferBonuses
  );

  return options
    .map((option) => {
      const totalPoints = option.requiredCardPoints * totalMultiplier;
      const balance = getNumericBalance(option.card);
      const balanceKnown = balance !== null;
      const canBook = balanceKnown && balance >= totalPoints;
      const pointsShort = balanceKnown
        ? Math.max(0, totalPoints - balance)
        : 0;

      const rank = canBook ? 0 : balanceKnown ? 2 : 1;

      return {
        ...option,
        totalPoints,
        balance,
        balanceKnown,
        canBook,
        pointsShort,
        rank,
      };
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.totalPoints - b.totalPoints;
    });
};

const getRecommendedTransferOption = (deal: FlightDeal) => {
  const ranked = getRankedTransferOptions(deal);
  return ranked.length > 0 ? ranked[0] : null;
};

  const getDealTotals = (deal: FlightDeal) => {
const recommendedTransfer = getRecommendedTransferOption(deal);
const transfer = recommendedTransfer;

const totalCardPoints = transfer
  ? transfer.totalPoints
  : deal.miles * totalMultiplier;

const balance = transfer ? transfer.balance : null;
const balanceKnown = transfer ? transfer.balanceKnown : false;
const canBook = transfer ? transfer.canBook : false;
const pointsShort = transfer ? transfer.pointsShort : 0;

    return {
      transfer,
      totalCardPoints,
      totalAirlineMiles: deal.miles * totalMultiplier,
      totalTaxes: deal.taxes * totalMultiplier,
      totalCashPrice: deal.estimatedCashPrice * totalMultiplier,
      balance,
      balanceKnown,
      canBook,
      pointsShort,
    };
  };

  const getBookabilityRank = (deal: FlightDeal) => {
    const totals = getDealTotals(deal);

    if (!totals.transfer) return 3;
    if (!totals.balanceKnown) return 1;
    if (totals.canBook) return 0;
    return 2;
  };

  const displayedResults = useMemo(() => {
    let filtered = [...results];

    if (nonstopOnly) {
      filtered = filtered.filter((deal) => deal.stops === "Nonstop");
    }

    return filtered.sort((a, b) => {
      const totalsA = getDealTotals(a);
      const totalsB = getDealTotals(b);

      const rankA = getBookabilityRank(a);
      const rankB = getBookabilityRank(b);

      if (sortMode === "Best overall") {
        if (rankA !== rankB) return rankA - rankB;
        return b.score - a.score;
      }

      if (sortMode === "Lowest points") {
        return totalsA.totalCardPoints - totalsB.totalCardPoints;
      }

      if (sortMode === "Lowest taxes") {
        return totalsA.totalTaxes - totalsB.totalTaxes;
      }

      if (sortMode === "Lowest cash price") {
        return totalsA.totalCashPrice - totalsB.totalCashPrice;
      }

      if (sortMode === "Nonstop first") {
        if (a.stops === b.stops) return b.score - a.score;
        return a.stops === "Nonstop" ? -1 : 1;
      }

      return b.score - a.score;
    });
  }, [
    results,
    nonstopOnly,
    sortMode,
    selectedCards,
    applyTransferBonuses,
    totalMultiplier,
    pointBalances,
  ]);

  const toggleCard = (card: string) => {
    setSelectedCards((current) =>
      current.includes(card)
        ? current.filter((item) => item !== card)
        : [...current, card]
    );
  };

  const toggleCardDatabase = (cardName: string) => {
  setExpandedCardDatabases((current) =>
    current.includes(cardName)
      ? current.filter((name) => name !== cardName)
      : [...current, cardName]
  );
};

  const updatePointBalance = (card: string, value: string) => {
    const cleanedValue = value.replace(/[^\d,]/g, "");

    setPointBalances((current) => ({
      ...current,
      [card]: cleanedValue,
    }));
  };

  const saveProfile = () => {
    localStorage.setItem(
      "airlineMilesProfile",
      JSON.stringify({
        homeAirport: from,
        preferredCabin: cabin,
        cards: selectedCards,
        tripType,
        adults,
        children,
        infantsInSeat,
        infantsOnLap,
        pointBalances,
      })
    );

    alert("Profile saved on this browser.");
  };

  const saveTrip = (deal: FlightDeal) => {
    const updated = [...savedTrips, deal];
    setSavedTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  };

  const removeSavedTrip = (indexToRemove: number) => {
    const updated = savedTrips.filter((_, index) => index !== indexToRemove);
    setSavedTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  };

  const handleSearch = async () => {
  if (tripType === "Multi-city") return;

  setIsSearching(true);
  setView("Results");

  const deals = await searchFlightDeals({
    from,
    to,
    departureDate,
    returnDate,
    cabin,
    flexibleDates,
    selectedCards,
    includeNearbyAirports,
    applyTransferBonuses,
  });

  setTimeout(() => {
    setResults(deals);
    setIsSearching(false);
  }, 700);
};


  const renderResultCard = (deal: FlightDealWithSource, index: number) => {
    const dealId = `${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`;
const isExpanded = expandedDeals.includes(dealId);
const returnPreview =
  tripType === "Round trip" ? buildReturnPreview(deal, returnDate) : null;
    const centsPerMile = getCentsPerMile(deal);
    const label = getDealLabel(centsPerMile);
    const style = getDealStyle(centsPerMile);
    const recommendation = getRecommendation(deal);
const transferOptions = getRankedTransferOptions(deal);

    const {
      transfer,
      totalCardPoints,
      totalAirlineMiles,
      totalTaxes,
      totalCashPrice,
      balanceKnown,
      canBook,
      pointsShort,
    } = getDealTotals(deal);

    return (
      <div
        key={`${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-4"
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="flex items-center gap-3">
  <div
    className={`w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold ${getBrandStyle(
      deal.airline
    )}`}
  >
    {getLogoInitials(deal.airline)}
  </div>

  <div>
    <p className="font-bold text-xl text-slate-900">{deal.airline}</p>
    <div className="flex items-center gap-2 mt-1">
      <span
        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${getBrandStyle(
          deal.program
        )}`}
      >
        {getLogoInitials(deal.program)}
      </span>
      <p className="text-xs text-slate-500">{deal.program}</p>
    </div>
  </div>
</div>

              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                {deal.tag}
              </span>
              {"dataSource" in deal && (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      deal.dataSource === "seats_aero_cached"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {deal.dataSource === "seats_aero_cached"
      ? "Seats.aero cached data"
      : "Placeholder data"}
  </span>
)}

              {transfer && balanceKnown && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    canBook
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {canBook ? "Bookable" : "Not enough points"}
                </span>
              )}

              {transfer && !balanceKnown && (
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Balance not entered
                </span>
              )}
            </div>

            <div className="mt-2 space-y-3">
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
    <p className="text-xs font-semibold text-slate-500 mb-1">
      Outbound
    </p>

    <p className="text-slate-600 text-sm">
      {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
    </p>

    <p className="text-sm font-semibold text-slate-900 mt-1">
  {getAwardScheduleText(deal)}
  {" • "}
  {getAwardDurationText(deal)}
  {" • "}
  {getAwardRouteTypeText(deal)}
</p>
  </div>

  {returnPreview && (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-semibold text-slate-500 mb-1">
        Return
      </p>

      <p className="text-slate-600 text-sm">
        {returnPreview.from} → {returnPreview.to} • {returnPreview.date} •{" "}
        {deal.cabin}
      </p>

      <p className="text-sm font-semibold text-slate-900 mt-1">
        {returnPreview.departureTime} → {returnPreview.arrivalTime}
        <span className="text-xs text-slate-500 ml-1">
          {returnPreview.stops === "Nonstop" ? "" : "(+1)"}
        </span>
        {" • "}
        {returnPreview.duration} •{" "}
        {returnPreview.stops === "Nonstop"
          ? "Nonstop"
          : returnPreview.stopCity
          ? `1 stop via ${returnPreview.stopCity}`
          : "1 stop"}
      </p>
    </div>
  )}
</div>
<button
  onClick={() => toggleExpandedDeal(dealId)}
  className="mt-5 w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
>
  {isExpanded ? "Hide flight details" : "View flight details"}
</button>

{isExpanded && (
  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
    {"dataSource" in deal && deal.dataSource === "seats_aero_cached" ? (
  <div>
    <p className="font-semibold text-slate-900 mb-2">
      Schedule details
    </p>
    <p className="text-sm text-slate-600">
  This result uses real cached award availability. Exact flight times,
  flight numbers, layover airports, and aircraft details are not included
  in the current API response yet. Always confirm the final itinerary on
  the booking program before transferring points.
</p>
    <p className="text-sm text-slate-800 mt-3 font-semibold">
      Route: {deal.from} → {deal.to}
    </p>
    <p className="text-sm text-slate-600">
      Availability type: {getAwardRouteTypeText(deal)}
    </p>
  </div>
) : (
  <>
    <p className="font-semibold text-slate-900 mb-3">
      Outbound flight details
    </p>

    <div className="space-y-4">
      {deal.segments.map((segment, segmentIndex) => (
        <div key={`${segment.from}-${segment.to}-${segmentIndex}`}>
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">
                {segment.from} → {segment.to}
              </p>
              <p className="text-sm text-slate-600">
                {segment.departureTime} → {segment.arrivalTime} •{" "}
                {segment.duration}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {segment.airline} • {deal.cabin} • {segment.aircraft}
              </p>
            </div>

            <span className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 h-fit text-slate-600">
              Segment {segmentIndex + 1}
            </span>
          </div>

          {deal.segments.length > 1 &&
            segmentIndex < deal.segments.length - 1 && (
              <div className="mt-3 text-xs text-slate-500 border-l-2 border-slate-300 pl-3">
                Layover in {deal.stopCity} • approx. 2h
              </div>
            )}<p className="font-semibold text-slate-900 mb-3"></p>
        </div>
      ))}

      {returnPreview && (
  <div className="mt-5 border-t border-slate-300 pt-4">
    <p className="font-semibold text-slate-900 mb-3">
      Return flight details
    </p>

    <div className="flex justify-between gap-4">
      <div>
        <p className="font-semibold text-slate-900">
          {returnPreview.from} → {returnPreview.to}
        </p>

        <p className="text-sm text-slate-600">
          {returnPreview.departureTime} → {returnPreview.arrivalTime} •{" "}
          {returnPreview.duration}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          {deal.airline} • {deal.cabin} • estimated return segment
        </p>
      </div>

      <span className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 h-fit text-slate-600">
        Return
      </span>
    </div>

    {returnPreview.stops !== "Nonstop" && returnPreview.stopCity && (
      <div className="mt-3 text-xs text-slate-500 border-l-2 border-slate-300 pl-3">
        Layover in {returnPreview.stopCity} • approx. 2h
      </div>
    )}
  </div>
)}
    </div>
  </>
)}
  </div>
)}

            <p className="text-xs text-slate-500 mt-1">
              Total shown for {paidTravelers} paid traveler
              {paidTravelers === 1 ? "" : "s"}
              {tripType === "Round trip" ? " × round trip" : ""}
            </p>
          </div>

          <span className={`${style} h-fit px-3 py-1 rounded-full text-sm font-semibold`}>
            {label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-700">Total Card Points Cost</p>
            <p className="font-bold text-lg text-purple-900">
              {totalCardPoints.toLocaleString()}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {transfer ? `${transfer.card} points` : "estimated miles"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Airline Miles</p>
            <p className="font-bold text-lg">
              {totalAirlineMiles.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Taxes & Fees</p>
            <p className="font-bold text-lg">${totalTaxes.toFixed(2)}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Est. Total Cash Price</p>
            <p className="font-bold text-lg">${totalCashPrice}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Point Value</p>
            <p className="font-bold text-lg">
              {centsPerMile.toFixed(2)}¢ / point
            </p>
          </div>
        </div>

        {transfer ? (
          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="font-semibold text-purple-900 mb-1">
              Best Booking Strategy
            </p>

            <p className="text-sm text-purple-900">
              Transfer {transfer.card} points →{" "}
<span className="inline-flex items-center gap-2 font-semibold">
  <span
    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${getBrandStyle(
      transfer.program
    )}`}
  >
    {getLogoInitials(transfer.program)}
  </span>
  {transfer.program}
</span>
            </p>

            <p className="text-sm text-purple-900 mt-1">
              Base ratio: 1,000 {transfer.card} points ={" "}
              {(1000 * transfer.ratio).toLocaleString()} partner points
            </p>

            {transfer.bonusPercent > 0 && (
              <p className="text-sm text-purple-900 mt-1">
                Prototype bonus applied: +{transfer.bonusPercent}%
              </p>
            )}
            <p className="text-sm text-purple-900 mt-1">
  Estimated total card points needed:{" "}
  <span className="font-semibold">
    {totalCardPoints.toLocaleString()}
  </span>
</p>

<p className="text-xs text-purple-700 mt-2">
  Recommendation reason:{" "}
  {transfer.canBook
    ? "this is the best option you can currently book with your saved balances."
    : !transfer.balanceKnown
    ? "this is the lowest-cost path among your selected cards, but your balance is not entered."
    : "this is the best available path, but you need more points to book it."}
</p>



            {balanceKnown ? (
              <p
                className={`text-sm mt-2 font-semibold ${
                  canBook ? "text-green-800" : "text-red-800"
                }`}
              >
                {canBook
                  ? `You have enough ${transfer.card} points to book this.`
                  : `You need ${pointsShort.toLocaleString()} more ${transfer.card} points.`}
              </p>
            ) : (
              <p className="text-sm text-slate-600 mt-2">
                Enter your {transfer.card} balance to check if this is bookable.
              </p>
            )}

            {transferOptions.length > 1 && (
              <div className="mt-3 border-t border-purple-200 pt-3">
                <p className="text-xs font-semibold text-purple-900 mb-1">
                  Other available booking paths
                </p>

                {transferOptions.slice(1).map((option) => (
  <p
    key={`${option.card}-${option.program}`}
    className="text-xs text-purple-800"
  >
    {option.card} → {option.program}:{" "}
    {option.totalPoints.toLocaleString()} points{" "}
    {option.canBook
      ? "✅ bookable"
      : !option.balanceKnown
      ? "— balance unknown"
      : `— short ${option.pointsShort.toLocaleString()}`}
  </p>
))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-800 mb-1">
              Best Booking Strategy
            </p>
            <p className="text-sm text-slate-600">
              Transfer data for this result has not been added yet.
            </p>
          </div>
        )}

        <div className="mt-5 bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-slate-800">
              Miles vs Cash Recommendation:
            </p>
            

            <span
              className={`${recommendation.style} px-3 py-1 rounded-full text-xs font-semibold`}
            >
              {recommendation.label}
            </span>
          </div>

          <p className="text-sm text-slate-600">
            {recommendation.explanation}
          </p>
        </div>

        {"dataNote" in deal && (
  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-900">
    {deal.dataNote}
  </div>
)}
{deal.bookingLink && (
  <a
    href={deal.bookingLink}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 block w-full bg-slate-900 text-white text-center rounded-xl p-3 font-semibold hover:bg-slate-700"
  >
    Check availability with {deal.program}
  </a>
)}

        <button
          onClick={() => saveTrip(deal)}
          className="mt-4 w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
        >
          Save this option
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500">
            Award travel search
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Vantara
          </h1>

          <p className="text-slate-600 mt-2">
            Find smarter ways to book flights using transferable credit card points.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
          {(["Search", "Results", "Wallet", "Saved", "Data"] as View[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`rounded-xl p-3 text-sm font-semibold ${
                  view === item
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {view === "Search" && (
  <SearchScreen
    tripType={tripType}
    setTripType={setTripType}
    from={from}
    setFrom={setFrom}
    to={to}
    setTo={setTo}
    departureDate={departureDate}
    setDepartureDate={setDepartureDate}
    returnDate={returnDate}
    setReturnDate={setReturnDate}
    cabin={cabin}
    setCabin={setCabin}
    adults={adults}
    setAdults={setAdults}
    children={children}
    setChildren={setChildren}
    infantsInSeat={infantsInSeat}
    setInfantsInSeat={setInfantsInSeat}
    infantsOnLap={infantsOnLap}
    setInfantsOnLap={setInfantsOnLap}
    flexibleDates={flexibleDates}
    setFlexibleDates={setFlexibleDates}
    includeNearbyAirports={includeNearbyAirports}
    setIncludeNearbyAirports={setIncludeNearbyAirports}
    applyTransferBonuses={applyTransferBonuses}
    setApplyTransferBonuses={setApplyTransferBonuses}
    isSearching={isSearching}
    handleSearch={handleSearch}
    selectedCards={selectedCards}
    pointBalances={pointBalances}
    onEditWallet={() => setView("Wallet")}
  />
)}

        {view === "Wallet" && (
  <WalletScreen
    selectedCards={selectedCards}
    pointBalances={pointBalances}
    expandedCardDatabases={expandedCardDatabases}
    onToggleCard={toggleCard}
    onToggleCardDatabase={toggleCardDatabase}
    onUpdatePointBalance={updatePointBalance}
    onSaveProfile={saveProfile}
    onBackToSearch={() => setView("Search")}
  />
)}



        {view === "Results" && (
          <div>
            <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-200 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Results
                  </h2>
                  <p className="text-sm text-slate-500">
                    Bookable results appear first. Blank point balances are
                    treated as unknown, not zero.
                  </p>
                </div>

                <button
                  onClick={() => setView("Search")}
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
                  {paidTravelers} paid traveler
                  {paidTravelers === 1 ? "" : "s"} • {tripType}
                </div>
              </div>
            </div>

            {!isSearching && hasRealResults && (
  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-sm text-green-900">
    Showing real cached award availability from Seats.aero. Exact itinerary details
are not included yet, so confirm schedules and stops before transferring points.
  </div>
)}

{!isSearching && hasOnlyPlaceholderResults && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 text-sm text-yellow-900">
    No real cached award options were found for this exact route and date.
    Simulated results are shown so you can still compare transfer partners,
    point costs, and wallet logic.
  </div>
)}

            {isSearching && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-500">
                Searching realistic placeholder results...
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
        )}

        {view === "Saved" && (
  <SavedTrips
    savedTrips={savedTrips}
    onRemoveSavedTrip={removeSavedTrip}
  />
)}

        {view === "Data" && <DataNotes />}
      </div>
    </main>
  );
}


