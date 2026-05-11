import { FlightDeal, generateRealisticDeals } from "./logic";

export type SearchFlightDealsInput = {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  cabin: string;
  flexibleDates: boolean;
  selectedCards: string[];
  includeNearbyAirports: boolean;
  applyTransferBonuses: boolean;
};

export type FlightDealWithSource = FlightDeal & {
  dataSource: "seats_aero_cached" | "placeholder";
  dataNote: string;
  routeConfidence: "cached_availability_only" | "simulated" | "real_itinerary";
  seatsRemaining?: number;
  seatsAeroSource?: string;
  bookingLink?: string;
  flightNumbers?: string;
};

const airlineNames: Record<string, string> = {
  AA: "American Airlines",
  AC: "Air Canada",
  AI: "Air India",
  AF: "Air France",
  AS: "Alaska Airlines",
  BA: "British Airways",
  B6: "JetBlue",
  BR: "EVA Air",
  CX: "Cathay Pacific",
  DL: "Delta Air Lines",
  EK: "Emirates",
  EY: "Etihad Airways",
  FI: "Icelandair",
  IB: "Iberia",
  JL: "Japan Airlines",
  KL: "KLM",
  LH: "Lufthansa",
  LO: "LOT Polish Airlines",
  LX: "SWISS",
  MS: "EgyptAir",
  NH: "ANA",
  NK: "Spirit Airlines",
  OS: "Austrian Airlines",
  QF: "Qantas",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  TK: "Turkish Airlines",
  TP: "TAP Air Portugal",
  UA: "United Airlines",
  VS: "Virgin Atlantic",
  QK: "Air Canada Express",
  "6E": "IndiGo",

  
};

const bookingLinks: Record<string, string> = {
  delta: "https://www.delta.com",
  united: "https://www.united.com",
  aeroplan: "https://www.aircanada.com/aeroplan",
  lifemiles: "https://www.lifemiles.com",
  virginatlantic: "https://www.virginatlantic.com",
  flyingblue: "https://www.flyingblue.com",
  emirates: "https://www.emirates.com",
  qantas: "https://www.qantas.com",
  alaska: "https://www.alaskaair.com",
  britishairways: "https://www.britishairways.com",
  qatar: "https://www.qatarairways.com",
  singapore: "https://www.singaporeair.com",
  etihad: "https://www.etihad.com",
  indigo: "https://www.goindigo.in",
};

const sourceProgramNames: Record<string, string> = {
  delta: "Delta SkyMiles®",
  united: "United MileagePlus®",
  aeroplan: "Aeroplan®",
  lifemiles: "LifeMiles®",
  virginatlantic: "Virgin Atlantic Flying Club®",
  flyingblue: "Flying Blue®",
  emirates: "Emirates Skywards®",
  qantas: "Qantas Frequent Flyer®",
  alaska: "Alaska Mileage Plan®",
  britishairways: "British Airways Executive Club®",
  qatar: "Qatar Privilege Club®",
  singapore: "Singapore KrisFlyer®",
  etihad: "Etihad Guest®",
};

const sourceTransferMatch: Record<string, string> = {
  delta: "Delta",
  united: "United",
  aeroplan: "Air Canada",
  lifemiles: "Avianca",
  virginatlantic: "Virgin Atlantic",
  flyingblue: "Air France",
  emirates: "Emirates",
  qantas: "Qantas",
  alaska: "Alaska",
  britishairways: "British Airways",
  qatar: "Qatar",
  singapore: "Singapore",
  etihad: "Etihad",
};

const getCabinPrefix = (cabin: string) => {
  if (cabin === "Premium Economy") return "W";
  if (cabin === "Business") return "J";
  if (cabin === "First") return "F";
  return "Y";
};

const getSeatsAeroCabin = (cabin: string) => {
  if (cabin === "Premium Economy") return "premium";
  if (cabin === "Business") return "business";
  if (cabin === "First") return "first";
  return "economy";
};

const getAirlineName = (codes: string, fallback?: string) => {
  const firstCode = codes?.split(",")[0]?.trim();
  return airlineNames[firstCode] || firstCode || fallback || "Unknown Airline";
};

const getProgramName = (source: string) => {
  return sourceProgramNames[source] || source;
};

const getNumericField = (item: any, field: string) => {
  const value = item[field];
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const fetchTripDetails = async (id: string) => {
  try {
    const response = await fetch(`/api/seats/trips?id=${id}`);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Trip fetch failed", error);
    return null;
  }
};

export const searchFlightDeals = async (
  input: SearchFlightDealsInput
): Promise<FlightDealWithSource[]> => {
  const fallbackDeals = generateRealisticDeals({
    from: input.from,
    to: input.to,
    date: input.departureDate,
    cabin: input.cabin,
    flexibleDates: input.flexibleDates,
    selectedCards: input.selectedCards,
    includeNearbyAirports: input.includeNearbyAirports,
    applyTransferBonuses: input.applyTransferBonuses,
  });

  try {
    const params = new URLSearchParams({
  origin_airport: input.from,
  destination_airport: input.to,
  start_date: input.departureDate,
  end_date: input.departureDate,
  take: "100",
  order_by: "lowest_mileage",
  cabins: getSeatsAeroCabin(input.cabin),
  include_filtered: "true",
  include_trips: "true",
});

    const response = await fetch(`/api/seats?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Seats.aero request failed");
    }

const json = await response.json();

console.log("Seats.aero full response sample:", json.data?.[0]);



const cabinPrefix = getCabinPrefix(input.cabin);

    const validResults = (json.data || [])
      .filter((item: any) => {
        const available = Boolean(item[`${cabinPrefix}Available`]);
        const miles = getNumericField(item, `${cabinPrefix}MileageCost`);
        const seats = getNumericField(item, `${cabinPrefix}RemainingSeats`);
        const airlineCodes = item[`${cabinPrefix}Airlines`] || item[`${cabinPrefix}AirlinesRaw`] || "";

        return available && miles > 0 && seats > 0;
      })
      .sort((a: any, b: any) => {
        return (
          getNumericField(a, `${cabinPrefix}MileageCost`) -
          getNumericField(b, `${cabinPrefix}MileageCost`)
        );
      });

    const uniqueResults = Array.from(
      new Map(
        validResults.map((item: any) => {
          const airlineCodes =
            item[`${cabinPrefix}Airlines`] ||
            item[`${cabinPrefix}AirlinesRaw`] ||
            "";

          const key = [
            item.Source,
            item.Date,
            airlineCodes,
            item[`${cabinPrefix}MileageCost`],
            item.Route?.OriginAirport,
            item.Route?.DestinationAirport,
          ].join("-");

          return [key, item];
        })
      ).values()
    );

    if (uniqueResults.length === 0) {
      return fallbackDeals.map((deal) => ({
  ...deal,
  dataSource: "placeholder",
  routeConfidence: "simulated",
  dataNote:
    "No usable cached Seats.aero award results were found for this exact search, so this result uses simulated fallback data.",
}));
    }

    const enrichedResults = await Promise.all(
  uniqueResults.map(async (item: any, index: number) => {
      const template = fallbackDeals[index % fallbackDeals.length] || {
        departureTime: "",
        arrivalTime: "",
        duration: "",
        aircraft: "",
        stopCity: undefined,
        segments: [],
        airline: "",
        miles: 0,
        taxes: 0,
        program: "",
        estimatedCashPrice: 0,
        from: input.from,
        to: input.to,
        date: input.departureDate,
        stops: "1 stop",
        cabin: input.cabin,
        score: 50,
        tag: "Cached Award",
        routeDataSource: "specific route" as const,
      };

      const airlineCodes =
        item[`${cabinPrefix}Airlines`] ||
        item[`${cabinPrefix}AirlinesRaw`] ||
        "";

      const miles = getNumericField(item, `${cabinPrefix}MileageCost`);
      const taxes = getNumericField(item, `${cabinPrefix}TotalTaxes`) / 100;
      const seatsRemaining = getNumericField(item, `${cabinPrefix}RemainingSeats`);
      const direct = Boolean(item[`${cabinPrefix}Direct`]);

      const tripDetails = await fetchTripDetails(item.ID);

console.log("Trip details full:", tripDetails);

const firstTrip = tripDetails?.data?.[0];

const segments = firstTrip?.AvailabilitySegments || [];
console.log("FIRST SEGMENT", segments[0]);

const firstSegment = segments[0];
const lastSegment = segments[segments.length - 1];

const stopCount =
  segments.length > 0 ? Math.max(0, segments.length - 1) : null;

const stopCity =
  segments.length > 1 ? segments[0]?.DestinationAirport : undefined;

const aircraft =
  segments
    .map((segment: any) => segment.AircraftName)
    .filter(Boolean)
    .join(", ");

const flightNumbers =
  segments
    .map(
      (segment: any) =>
        segment.FlightNumber
    )
    .join(", ");

const formattedSegments = segments.map((segment: any) => ({
  from: segment.OriginAirport,
  to: segment.DestinationAirport,
  departureTime: segment.DepartsAt,
  arrivalTime: segment.ArrivesAt,
  duration: segment.Duration
  ? `${Math.floor(segment.Duration / 60)}h ${
      segment.Duration % 60
    }m`
  : "",
  aircraft: segment.AircraftName || "",
  airline:
  airlineNames[segment.Source?.toUpperCase()] ||
  segment.Source ||
  "",
}));

      const programName = getProgramName(item.Source);
const airlineName = getAirlineName(airlineCodes, programName);

      return {
        ...template,
        airline: airlineName,
        transferAirlineMatch: sourceTransferMatch[item.Source] || airlineName,
        miles,
        taxes,
        program: programName,
        bookingLink: bookingLinks[item.Source],
        estimatedCashPrice: Math.round(miles * 0.018),
        from: item.Route?.OriginAirport || input.from,
        to: item.Route?.DestinationAirport || input.to,
        date: item.Date,
        stops:
  stopCount === null
    ? "Stops unknown"
    : stopCount === 0
    ? "Nonstop"
    : `${stopCount} stop${stopCount > 1 ? "s" : ""}`,

cabin: input.cabin,

departureTime: firstSegment?.DepartsAt || "",
arrivalTime: lastSegment?.ArrivesAt || "",

duration: firstTrip?.TotalDuration
  ? `${Math.floor(firstTrip.TotalDuration / 60)}h ${
      firstTrip.TotalDuration % 60
    }m`
  : "",

aircraft,
stopCity,
segments: formattedSegments,
flightNumbers,
        tag: index === 0 ? "Best Real Award" : "Cached Award",
        score: Math.max(50, 100 - index * 5),
        seatsRemaining,
        seatsAeroSource: item.Source,
        dataSource: "seats_aero_cached" as const,
routeConfidence:
  segments.length > 0
    ? ("real_itinerary" as const)
    : ("cached_availability_only" as const),
dataNote:
  `Real itinerary details were retrieved from Seats.aero trip data.`,
         };
      }),
    );

return enrichedResults;
  } catch (error) {
    console.error(error);

    return fallbackDeals.map((deal) => ({
  ...deal,
  dataSource: "placeholder",
  routeConfidence: "simulated",
  dataNote:
    "Seats.aero data could not be loaded, so this result uses simulated fallback data.",

    }));
  }
};