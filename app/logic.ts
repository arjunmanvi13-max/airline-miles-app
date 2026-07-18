import {
  airports,
  airlines,
  prototypeTransferBonuses,
  routeAirlines,
  transferPartners,
  type AirlineData,
} from "./data";

export type FlightDeal = {
  departureTime: string;
arrivalTime: string;
duration: string;
aircraft: string;
stopCity?: string;
flightNumber?: string;

segments: {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  airline: string;
  flightNumber?: string;

}[];
  airline: string;
  transferAirlineMatch?: string;
  miles: number;
  taxes: number;
  program: string;
  estimatedCashPrice: number;
  from: string;
  to: string;
  date: string;
  stops: string;
  cabin: string;
  score: number;
  tag: string;
  routeDataSource: "specific route" | "route type fallback";
};

export const getTransferOptions = (
  deal: FlightDeal,
  selectedCards: string[],
  applyTransferBonuses: boolean
) => {
  const matchTarget = deal.transferAirlineMatch || deal.program || deal.airline;

  const options = transferPartners
    .filter((partner) => {
      const cardMatches =
        selectedCards.length === 0 || selectedCards.includes(partner.card);

      const airlineMatches = matchTarget
        .toLowerCase()
        .includes(partner.airlineMatch.toLowerCase());

      return cardMatches && airlineMatches;
    })
    .map((transfer) => {
      const bonus = prototypeTransferBonuses.find(
        (item) => item.card === transfer.card && item.program === transfer.program
      );

      const bonusPercent = applyTransferBonuses && bonus ? bonus.bonusPercent : 0;
      const effectiveRatio = transfer.ratio * (1 + bonusPercent / 100);
      const requiredCardPoints = Math.ceil(deal.miles / effectiveRatio);

      return {
        ...transfer,
        bonusPercent,
        effectiveRatio,
        requiredCardPoints,
      };
    });

  return options.sort((a, b) => a.requiredCardPoints - b.requiredCardPoints);
};

export const getBestTransferOption = (
  deal: FlightDeal,
  selectedCards: string[],
  applyTransferBonuses: boolean
) => {
  const options = getTransferOptions(deal, selectedCards, applyTransferBonuses);
  return options.length > 0 ? options[0] : null;
};

export const getWalletStatus = (
  deal: FlightDeal,
  selectedCards: string[],
  applyTransferBonuses: boolean,
  pointBalances: Record<string, string>
) => {
  const bestOption = getBestTransferOption(
    deal,
    selectedCards,
    applyTransferBonuses
  );

  if (!bestOption) {
    return {
      canBook: false,
      shortage: null,
      balance: null,
    };
  }

  const balance = Number(
    (pointBalances[bestOption.card] || "0").replace(/,/g, "")
  );

  return {
    canBook: balance >= bestOption.requiredCardPoints,
    shortage: Math.max(
      0,
      bestOption.requiredCardPoints - balance
    ),
    balance,
  };
};

export const getUnifiedPointsCost = (
  deal: FlightDeal,
  selectedCards: string[],
  applyTransferBonuses: boolean
) => {
  const transfer = getBestTransferOption(
    deal,
    selectedCards,
    applyTransferBonuses
  );

  if (!transfer) {
    return {
      available: false,
      card: deal.program,
      program: "Unknown transfer program",
      pointsNeeded: deal.miles,
      bonusPercent: 0,
      dataStatus: "missing",
    };
  }

  return {
    available: true,
    card: transfer.card,
    program: transfer.program,
    pointsNeeded: transfer.requiredCardPoints,
    bonusPercent: transfer.bonusPercent,
    dataStatus: transfer.dataStatus,
  };
};

export const getCabinMultiplier = (cabin: string) => {
  if (cabin === "Premium Economy") return 1.5;
  if (cabin === "Business") return 2.5;
  if (cabin === "First") return 4;
  return 1;
};

export const getRouteType = (from: string, to: string) => {
  const fromAirport = airports.find((a) => a.code === from);
  const toAirport = airports.find((a) => a.code === to);

  if (!fromAirport || !toAirport) return "domestic";

  const northAmericaCountries = ["US", "CA", "MX"];
  const europeContinent = "EU";
  const asiaContinent = "AS";
  const middleEastCountries = ["AE", "QA", "SA", "TR", "IL", "JO", "KW", "OM", "BH"];

  const fromIsNorthAmerica = northAmericaCountries.includes(fromAirport.country);
  const toIsNorthAmerica = northAmericaCountries.includes(toAirport.country);

  const fromIsEurope = fromAirport.region === europeContinent;
  const toIsEurope = toAirport.region === europeContinent;

  const fromIsAsia = fromAirport.region === asiaContinent;
  const toIsAsia = toAirport.region === asiaContinent;

  const fromIsMiddleEast = middleEastCountries.includes(fromAirport.country);
  const toIsMiddleEast = middleEastCountries.includes(toAirport.country);

  if (fromIsNorthAmerica && toIsNorthAmerica) return "domestic";

  if (
    (fromIsNorthAmerica && toIsEurope) ||
    (fromIsEurope && toIsNorthAmerica)
  ) {
    return "transatlantic";
  }

  if (fromIsMiddleEast || toIsMiddleEast) return "middleEast";
  if (fromIsAsia || toIsAsia) return "asia";
  if (fromIsEurope || toIsEurope) return "europe";

  return "domestic";
};

export const getNearbyAirports = (code: string) => {
  const selected = getAirport(code);

  if (!selected) return [code];

  return airports
    .filter((airport) => {
      if (!airport.latitude || !airport.longitude) return false;
      if (airport.code === code) return true;

      const distance = getDistanceMiles(code, airport.code);

      return distance <= 75;
    })
    .sort((a, b) => getDistanceMiles(code, a.code) - getDistanceMiles(code, b.code))
    .slice(0, 4)
    .map((airport) => airport.code);
};
export const addDays = (dateString: string, days: number) => {
  const currentDate = new Date(dateString);
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate.toISOString().split("T")[0];
};

export const findSpecificRouteAirlines = (from: string, to: string) => {
  const exactMatch = routeAirlines.find(
    (route) => route.from === from && route.to === to
  );

  if (exactMatch) return exactMatch.airlines;

  const reverseMatch = routeAirlines.find(
    (route) => route.from === to && route.to === from
  );

  return reverseMatch?.airlines || null;
};

export const getAirlinesForRoute = (
  from: string,
  to: string,
  selectedCards: string[]
) => {
  const routeType = getRouteType(from, to);
  const specificAirlineNames = findSpecificRouteAirlines(from, to);

  const cardFilter = (airline: AirlineData) =>
    selectedCards.length === 0 || selectedCards.includes(airline.program);

  if (specificAirlineNames) {
    return airlines
      .filter((airline: AirlineData) =>
        specificAirlineNames.includes(airline.name)
      )
      .filter(cardFilter)
      .map((airline: AirlineData) => ({
        ...airline,
        routeDataSource: "specific route" as const,
      }));
  }

  return airlines
    .filter((airline: AirlineData) => {
      const routeWorks = airline.routes.includes(routeType);
      const cardWorks = cardFilter(airline);
      return routeWorks && cardWorks;
    })
    .map((airline: AirlineData) => ({
      ...airline,
      routeDataSource: "route type fallback" as const,
    }));
};

export const getCentsPerMile = (deal: FlightDeal) => {
  const valueAfterTaxes = deal.estimatedCashPrice - deal.taxes;
  return (valueAfterTaxes / deal.miles) * 100;
};

export const getDealScore = (
  deal: Omit<FlightDeal, "score" | "tag" | "routeDataSource">,
  applyTransferBonuses = true
) => {
  const centsPerMile =
    ((deal.estimatedCashPrice - deal.taxes) / deal.miles) * 100;

const unified = getUnifiedPointsCost(
  {
    ...deal,
    score: 0,
    tag: "",
    routeDataSource: "specific route",
  },
  [deal.program],
  applyTransferBonuses
);

  const taxPenalty = deal.taxes > 75 ? 8 : deal.taxes > 40 ? 4 : 0;
  const nonstopBonus = deal.stops === "Nonstop" ? 5 : 0;
  const lowUnifiedPointsBonus =
    unified.available && unified.pointsNeeded < 30000 ? 8 : 0;
  const transferDataBonus =
    unified.dataStatus === "real" ? 6 : unified.dataStatus === "placeholder" ? 2 : -4;

  return Math.round(
    centsPerMile * 30 +
      nonstopBonus +
      lowUnifiedPointsBonus +
      transferDataBonus -
      taxPenalty
  );
};

export const getDealTag = (deal: FlightDeal, index: number) => {
  if (index === 0) return "Best Overall";
  if (deal.taxes <= 10) return "Lowest Fees";
  if (deal.miles <= 25000) return "Lowest Miles";
  if (deal.stops === "Nonstop") return "Best Convenience";
  return "Good Option";
};

export const getDealLabel = (value: number) => {
  if (value >= 1.8) return "Excellent";
  if (value >= 1.4) return "Great";
  if (value >= 1.0) return "Good";
  return "Weak";
};

export const getDealStyle = (value: number) => {
  if (value >= 1.8) return "bg-green-100 text-green-800";
  if (value >= 1.4) return "bg-blue-100 text-blue-800";
  if (value >= 1.0) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export const getRecommendation = (deal: FlightDeal) => {
  const value = getCentsPerMile(deal);

  if (value >= 1.4) {
    return {
      label: "Use points",
      style: "bg-green-100 text-green-800",
      explanation:
        "This redemption gives strong value, so using transferable card points is likely better than paying cash.",
    };
  }

  if (value >= 1.0) {
    return {
      label: "Compare both",
      style: "bg-yellow-100 text-yellow-800",
      explanation:
        "This is a decent redemption, but compare it against paying cash before booking.",
    };
  }

  return {
    label: "Pay cash",
    style: "bg-red-100 text-red-800",
    explanation:
      "This redemption gives low value, so paying cash may be smarter.",
  };
};

export const getRedemptionScore = ({
  miles,
  taxes,
  cashPrice,
  cabin,
}: {
  miles: number;
  taxes: number;
  cashPrice: number;
  cabin: string;
}) => {
  if (!miles || !cashPrice) return null;

  const cpp = ((cashPrice - taxes) / miles) * 100;

  let score = 0;

  // CPP = main driver
  if (cpp >= 4.0) score = 95;
  else if (cpp >= 3.0) score = 88;
  else if (cpp >= 2.5) score = 82;
  else if (cpp >= 2.0) score = 74;
  else if (cpp >= 1.7) score = 68;
  else if (cpp >= 1.4) score = 60;
  else if (cpp >= 1.1) score = 48;
  else if (cpp >= 0.8) score = 35;
  else score = 20;

  // Premium cabin bump
  if (cabin === "Premium Economy") score += 3;
  if (cabin === "Business") score += 8;
  if (cabin === "First") score += 12;

  // Taxes adjustment
  if (taxes <= 25) score += 4;
  else if (taxes <= 100) score += 1;
  else if (taxes > 250) score -= 8;
  else if (taxes > 100) score -= 4;

  return Math.max(0, Math.min(100, Math.round(score)));
};



export const getRedemptionLabel = (score: number) => {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 45) return "Average";
  if (score >= 30) return "Weak";
  return "Poor";
};

export const getRedemptionReasons = ({
  miles,
  taxes,
  cashPrice,
  cabin,
}: {
  miles: number;
  taxes: number;
  cashPrice: number;
  cabin: string;
}) => {
  if (!miles || !cashPrice) return [];

  const cpp = ((cashPrice - taxes) / miles) * 100;
  const reasons: string[] = [];

  if (cpp >= 2.5) reasons.push("Exceptional cents-per-point value.");
  else if (cpp >= 2.0) reasons.push("Strong cents-per-point value.");
  else if (cpp >= 1.5) reasons.push("Solid redemption value.");
  else if (cpp < 1.0) reasons.push("Low redemption value compared to cash.");

  if (cabin === "Business") reasons.push("Premium cabin increases redemption value.");
  if (cabin === "First") reasons.push("First class awards can justify higher point costs.");
  if (cabin === "Premium Economy") reasons.push("Premium economy adds moderate value over economy.");

  if (taxes <= 25) reasons.push("Low taxes and fees improve the booking.");
  else if (taxes > 250) reasons.push("High taxes reduce the overall value.");
  else if (taxes > 100) reasons.push("Taxes are somewhat high for an award booking.");

  return reasons;
};

const aircraftOptions = [
  "Boeing 737",
  "Boeing 787",
  "Airbus A320",
  "Airbus A330",
  "Airbus A350",
  "Boeing 777",
];

const airlineHubs: Record<string, string[]> = {
  "Air Canada": ["YYZ", "YUL", "YVR"],
  ANA: ["HND", "NRT"],
  "Singapore Airlines": ["SIN"],
  Emirates: ["DXB"],
  "Qatar Airways": ["DOH"],
  "Turkish Airlines": ["IST"],
  "Air France / KLM": ["CDG", "AMS"],
  "British Airways": ["LHR"],
  "Virgin Atlantic": ["LHR"],
  "United Airlines": ["ORD", "EWR", "IAD", "SFO"],
  "American Airlines": ["DFW", "ORD", "MIA", "JFK"],
  "Delta Air Lines": ["ATL", "JFK", "DTW"],
  JetBlue: ["JFK", "BOS"],
  "Alaska Airlines": ["SEA"],
  "Southwest Airlines": ["ATL", "DEN"],
};

const formatHour = (hour: number) => {
  const totalMinutes = Math.round(hour * 60);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const hours24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  const suffix = hours24 >= 12 ? "PM" : "AM";
  const displayHour = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};


const getAirport = (code: string) => {
  return airports.find((airport) => airport.code === code);
};

const getDistanceMiles = (from: string, to: string) => {
  const fromAirport = getAirport(from);
  const toAirport = getAirport(to);

  if (!fromAirport || !toAirport) return 1000;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadiusMiles = 3958.8;

  const lat1 = toRadians(fromAirport.latitude);
  const lat2 = toRadians(toAirport.latitude);
  const deltaLat = toRadians(toAirport.latitude - fromAirport.latitude);
  const deltaLon = toRadians(toAirport.longitude - fromAirport.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMiles * c);
};

const getRealisticDurationHours = (from: string, to: string, stops: string) => {
  const distance = getDistanceMiles(from, to);

  const flightHours = distance / 520;
  const taxiBuffer = distance < 800 ? 0.75 : 1.25;
  const layoverBuffer = stops === "Nonstop" ? 0 : 2;

  return Math.max(1.25, Math.round((flightHours + taxiBuffer + layoverBuffer) * 2) / 2);
};

const formatDuration = (hours: number) => {
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);

  return `${fullHours}h ${String(minutes).padStart(2, "0")}m`;
};

const buildItinerary = ({
  from,
  to,
  airline,
  routeType,
  stops,
  index,
}: {
  from: string;
  to: string;
  airline: string;
  routeType: string;
  stops: string;
  index: number;
}) => {
  const startHour = 7 + ((index * 3) % 12);
  const durationHours = getRealisticDurationHours(from, to, stops);
  const aircraft = aircraftOptions[index % aircraftOptions.length];

  if (stops === "Nonstop") {
    return {
      departureTime: formatHour(startHour),
      arrivalTime: formatHour(startHour + durationHours),
      duration: formatDuration(durationHours),
      aircraft,
      stopCity: undefined,
      segments: [
        {
          from,
          to,
          departureTime: formatHour(startHour),
          arrivalTime: formatHour(startHour + durationHours),
          duration: formatDuration(durationHours),
          aircraft,
          airline,
        },
      ],
    };
  }

  const hubs = airlineHubs[airline] || ["ORD", "JFK", "ATL"];
const stopCity = hubs[index % hubs.length];
  const firstLegHours = Math.max(2, Math.floor(durationHours * 0.55));
  const layoverHours = 2;
  const secondLegHours = Math.max(2, durationHours - firstLegHours - layoverHours);

  return {
    departureTime: formatHour(startHour),
    arrivalTime: formatHour(startHour + durationHours),
    duration: formatDuration(durationHours),
    aircraft,
    stopCity,
    segments: [
      {
        from,
        to: stopCity,
        departureTime: formatHour(startHour),
        arrivalTime: formatHour(startHour + firstLegHours),
        duration: `${firstLegHours}h 00m`,
        aircraft,
        airline,
      },
      {
        from: stopCity,
        to,
        departureTime: formatHour(startHour + firstLegHours + layoverHours),
        arrivalTime: formatHour(startHour + durationHours),
        duration: `${secondLegHours}h 00m`,
        aircraft: aircraftOptions[(index + 1) % aircraftOptions.length],
        airline,
      },
    ],
  };
};

export const generateRealisticDeals = ({
  from,
  to,
  date,
  cabin,
  flexibleDates,
  selectedCards,
  includeNearbyAirports,
  applyTransferBonuses,
}: {
  from: string;
  to: string;
  date: string;
  cabin: string;
  flexibleDates: boolean;
  selectedCards: string[];
  includeNearbyAirports: boolean;
  applyTransferBonuses: boolean;
}) => {
  if (!from || !to || !date) return [];

  const fromOptions = includeNearbyAirports ? getNearbyAirports(from) : [from];
  const toOptions = includeNearbyAirports ? getNearbyAirports(to) : [to];

  const dateOffsets = flexibleDates ? [-2, -1, 0, 1, 2] : [0];
  const cabinMultiplier = getCabinMultiplier(cabin);

  const generatedDeals: FlightDeal[] = [];

  fromOptions.forEach((fromCode) => {
    toOptions.forEach((toCode) => {
      const routeType = getRouteType(fromCode, toCode);

      const routeDistanceFactor =
        routeType === "domestic"
          ? 1.1
          : routeType === "transatlantic"
          ? 1.7
          : routeType === "asia"
          ? 2.2
          : routeType === "middleEast"
          ? 2.0
          : 1.5;

      const possibleAirlines = getAirlinesForRoute(
        fromCode,
        toCode,
        selectedCards
      );

      dateOffsets.forEach((offset) => {
        possibleAirlines.forEach((airline: AirlineData & { routeDataSource: "specific route" | "route type fallback" }, index: number) => {
          const variation = 0.85 + ((index + Math.abs(offset)) % 5) * 0.08;

          const miles =
            Math.round(
              (airline.baseMiles *
                routeDistanceFactor *
                variation *
                cabinMultiplier) /
                500
            ) * 500;

          const estimatedCashPrice = Math.round(
            (230 *
              routeDistanceFactor *
              variation +
              80 +
              Math.abs(offset) * 18) *
              cabinMultiplier
          );

          const stops =
  airline.routeDataSource === "specific route"
    ? "Nonstop"
    : index % 3 === 0
    ? "Nonstop"
    : "1 stop";

const itinerary = buildItinerary({
  from: fromCode,
  to: toCode,
  airline: airline.name,
  routeType,
  stops,
  index,
});

const baseDeal = {
  airline: airline.name,
  miles,
  taxes: airline.tax,
  program: airline.program,
  estimatedCashPrice,
  from: fromCode,
  to: toCode,
  date: addDays(date, offset),
  stops,
  cabin,
  ...itinerary,
};

          const score = getDealScore(baseDeal, applyTransferBonuses);

          generatedDeals.push({
            ...baseDeal,
            score,
            tag: "Good Option",
            routeDataSource: airline.routeDataSource,
          });
        });
      });
    });
  });

  const sorted = generatedDeals.sort((a, b) => b.score - a.score);

  return sorted.map((deal, index) => ({
    ...deal,
    tag: getDealTag(deal, index),
  }));
};

export const getWalletFitScore = ({
  requiredPoints,
  balance,
}: {
  requiredPoints: number;
  balance: number | null;
}) => {
  if (balance === null) return null;

  const ratio = balance / requiredPoints;

  if (ratio >= 2) return 100;
  if (ratio >= 1.5) return 90;
  if (ratio >= 1.2) return 80;
  if (ratio >= 1) return 70;
  if (ratio >= 0.8) return 50;

  return 20;
};

export const getWalletFitLabel = (score: number | null) => {
  if (score === null) return "Unknown";
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Tight";
  return "Poor";
};

export const getWalletRecommendationText = ({
  canBook,
  balance,
  shortage,
  card,
  program,
}: {
  canBook: boolean;
  balance: number | null;
  shortage: number;
  card: string;
  program: string;
}) => {
  if (balance === null) {
    return {
      title: "Add your balance",
      body: `Enter your ${card} balance to see if you can book through ${program}.`,
      tone: "neutral",
    };
  }

  if (canBook) {
    return {
      title: "You have enough points",
      body: `Transfer from ${card} to ${program} and book this award after confirming availability.`,
      tone: "good",
    };
  }

  return {
    title: "You need more points",
    body: `You are short by ${shortage.toLocaleString()} ${card} points for this transfer path.`,
    tone: "warning",
  };
};

export const getBookingDecision = ({
  redemptionScore,
  walletFitScore,
  canBook,
  centsPerPoint,
}: {
  redemptionScore: number | null;
  walletFitScore: number | null;
  canBook: boolean;
  centsPerPoint: number | null;
}) => {
  const walletWasEntered = walletFitScore !== null;

  if (redemptionScore === null && centsPerPoint === null) {
    return {
      label: "Needs more data",
      tone: "neutral",
      explanation:
        "A cash price is needed to judge this redemption more accurately.",
    };
  }

  /*
    No wallet was entered.

    Vantara should judge redemption value normally, but must not claim
    the user cannot book or tell them not to transfer because of missing
    wallet information.
  */
  if (!walletWasEntered) {
    if (centsPerPoint !== null && centsPerPoint < 1.1) {
      return {
        label: "Consider paying cash",
        tone: "bad",
        explanation:
          "The redemption value appears weak compared with the available cash fare. Add your wallet for personalized bookability and transfer analysis.",
      };
    }

    if ((redemptionScore ?? 0) >= 80) {
      return {
        label: "Excellent redemption",
        tone: "strong",
        explanation:
          "This award appears to offer excellent value. Add your wallet to calculate point coverage and personalized transfer options.",
      };
    }

    if ((redemptionScore ?? 0) >= 70) {
      return {
        label: "Strong redemption",
        tone: "strong",
        explanation:
          "This award appears to offer strong value. Add your wallet to calculate bookability and personalized transfer options.",
      };
    }

    return {
      label: "Compare before booking",
      tone: "wallet",
      explanation:
        "This award may offer reasonable value. Your wallet has not been entered, so Vantara cannot calculate bookability or a personalized transfer path yet.",
    };
  }

  /*
    A wallet exists, but it does not cover the best transfer path.
  */
  if (!canBook) {
    return {
      label: "More points needed",
      tone: "warning",
      explanation:
        "Your current wallet does not cover the best transfer path. The redemption may still be valuable, but you would need more points or another booking option.",
    };
  }

  if ((redemptionScore ?? 0) >= 80 && walletFitScore >= 70) {
    return {
      label: "Book with points",
      tone: "strong",
      explanation:
        "This looks like a strong redemption and your wallet appears well-positioned to book it.",
    };
  }

  if (centsPerPoint !== null && centsPerPoint < 1.1) {
    return {
      label: "Consider paying cash",
      tone: "bad",
      explanation:
        "The redemption value looks weak compared with paying cash.",
    };
  }

  return {
    label: "Compare before booking",
    tone: "neutral",
    explanation:
      "This award may be reasonable, but compare the cash price, alternate programs, and transfer risk before booking.",
  };
};

export const getPreservePointsAdvice = ({
  bestCard,
  selectedCards,
}: {
  bestCard: string | null;
  selectedCards: string[];
}) => {
  if (!bestCard) {
    return "No preferred card strategy yet. Add award details to generate a recommendation.";
  }

  if (bestCard === "Bilt") {
    return "Using Bilt can be attractive when it unlocks partners like Alaska or American while preserving larger Amex and Chase balances.";
  }

  if (bestCard === "Chase") {
    return "Chase points are highly flexible. Use them when they clearly offer the best path, but preserve them if another wallet can book for a similar cost.";
  }

  if (bestCard === "Amex") {
    return "Amex is strong for international premium-cabin partners. This is a good use when the transfer path is efficient or a bonus is available.";
  }

  if (bestCard === "Capital One") {
    return "Capital One can be useful for international partners. This may preserve Chase or Amex flexibility for future trips.";
  }

  if (bestCard === "Citi") {
    return "Citi can be valuable for niche airline partners. This may be a smart use if it avoids draining more flexible balances.";
  }

  if (bestCard === "Wells Fargo") {
    return "Wells Fargo transfer options are newer, but can be useful when they match the award program cleanly.";
  }

  return `Using ${bestCard} appears to be the most efficient available wallet path.`;
};