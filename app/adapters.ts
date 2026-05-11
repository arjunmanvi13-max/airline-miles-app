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
  seatsRemaining?: number;
  seatsAeroSource?: string;
  bookingLink?: string;
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
    });

    const response = await fetch(`/api/seats?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Seats.aero request failed");
    }

    const json = await response.json();
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
        dataNote:
          "No usable cached Seats.aero award results were found for this exact search, so this result uses placeholder data.",
      }));
    }

    return uniqueResults.map((item: any, index: number) => {
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
        stops: direct ? "Direct award result" : "May include connections",
        cabin: input.cabin,
        departureTime: "Schedule details pending",
        arrivalTime: "",
        duration: "",
        aircraft: "",
        stopCity: undefined,
        segments: [],
        tag: index === 0 ? "Best Real Award" : "Cached Award",
        score: Math.max(50, 100 - index * 5),
        seatsRemaining,
        seatsAeroSource: item.Source,
        dataSource: "seats_aero_cached",
        dataNote:
          `Real cached Seats.aero award availability through ${programName}. Exact flight times, layovers, and flight numbers are not included yet.`,
      };
    });
  } catch (error) {
    console.error(error);

    return fallbackDeals.map((deal) => ({
      ...deal,
      dataSource: "placeholder",
      dataNote:
        "Seats.aero data could not be loaded, so this result uses placeholder data.",
    }));
  }
};