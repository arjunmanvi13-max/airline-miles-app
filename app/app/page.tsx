"use client";

import { useEffect, useMemo, useState } from "react";
import { cardEcosystems } from "../data";
import {
  FlightDeal,
  getCentsPerMile,
  getDealLabel,
  getDealStyle,
  getRecommendation,
  getTransferOptions,
} from "../logic";


import { FlightDealWithSource, searchFlightDeals } from "../adapters";
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
import ResultsScreen from "@/components/ResultsScreen";
import ResultCard from "@/components/ResultCard";
import CalculatorScreen from "@/components/CalculatorScreen";




type View = "Wallet" | "Analyzer" | "Saved" | "Data";
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
  const [view, setView] = useState<View>("Wallet");
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
  const [savedTrips, setSavedTrips] = useState<FlightDealWithSource[]>([]);
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
  results.length > 0 &&
  results.every(
    (deal) =>
      deal.dataSource === "placeholder" ||
      deal.dataSource === "no_cached_results"
  );
  

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
      setView("Analyzer");
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

  const saveTrip = (deal: FlightDealWithSource) => {
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

  if (!from || !to || !departureDate) {
    alert("Please choose a departure airport, arrival airport, and departure date.");
    return;
  }

  if (from === to) {
    alert("Departure and arrival airports must be different.");
    return;
  }

  setIsSearching(true);
setExpandedDeals([]);
setView("Analyzer");

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


const renderResultCard = (
  deal: FlightDealWithSource,
  index: number
) => (
  <ResultCard
  key={`${deal.program}-${deal.from}-${deal.to}-${deal.date}-${index}`}
    deal={deal}
    index={index}
    expandedDeals={expandedDeals}
    toggleExpandedDeal={toggleExpandedDeal}
    buildReturnPreview={buildReturnPreview}
    returnDate={returnDate}
    tripType={tripType}
    getCentsPerMile={getCentsPerMile}
    getDealLabel={getDealLabel}
    getDealStyle={getDealStyle}
    getRecommendation={getRecommendation}
    getRankedTransferOptions={getRankedTransferOptions}
    getDealTotals={getDealTotals}
    paidTravelers={paidTravelers}
    saveTrip={saveTrip}
  />
);

  return (
  <main className="min-h-screen bg-[#05060A] text-white">
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-700/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 bg-amber-700/10 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="mb-8 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-purple-300">
              Award travel intelligence
            </p>

            <h1 className="mt-3 text-5xl md:text-6xl font-serif font-normal tracking-tight text-white">
              Vantara
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base leading-7 text-slate-400">
              A premium points search experience built around your wallet,
              routing flexibility, and booking confidence.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
            <span className="h-px w-10 bg-white/20" />
            Private beta
          </div>
        </div>
      </header>

      <nav className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden border border-white/10 bg-white/10">
        {(["Wallet", "Analyzer", "Saved", "Data"] as View[]).map(
          (item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`px-4 py-4 text-sm font-semibold transition ${
                view === item
  ? "bg-purple-500/15 text-white"
                  : "bg-[#090B12] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {item}
            </button>
          )
        )}
      </nav>

      

      <div className={view === "Analyzer" ? "block" : "hidden"}>
  <CalculatorScreen
    selectedCards={selectedCards}
    applyTransferBonuses={applyTransferBonuses}
    pointBalances={pointBalances}
  />
</div>

<div className={view === "Wallet" ? "block" : "hidden"}>
  <WalletScreen
    selectedCards={selectedCards}
    pointBalances={pointBalances}
    expandedCardDatabases={expandedCardDatabases}
    onToggleCard={toggleCard}
    onToggleCardDatabase={toggleCardDatabase}
    onUpdatePointBalance={updatePointBalance}
    onSaveProfile={() => {
      saveProfile();
      setView("Analyzer");
    }}
    onBackToSearch={() => setView("Analyzer")}
  />
</div>

<div className={view === "Saved" ? "block" : "hidden"}>
  <SavedTrips
    savedTrips={savedTrips}
    onRemoveSavedTrip={removeSavedTrip}
  />
</div>

<div className={view === "Data" ? "block" : "hidden"}>
  <DataNotes />
</div>
    </div>
  </main>
);
}


