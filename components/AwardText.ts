import { FlightDealWithSource } from "@/app/adapters";



export const formatAirportTime = (value?: string, airportCode?: string) => {
  if (!value) return "";

  const timeMatch = value.match(/T(\d{2}):(\d{2})/);

  if (!timeMatch) return value;

  const hour = Number(timeMatch[1]);
  const minute = timeMatch[2];

  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return `${displayHour}:${minute} ${period}`;
};


export const isRealAwardResult = (deal: FlightDealWithSource) =>
  deal.dataSource === "seats_aero_cached";

export const isSimulatedAwardResult = (deal: FlightDealWithSource) =>
  !isRealAwardResult(deal);

export const getAwardSourceLabel = (deal: FlightDealWithSource) => {
  if (deal.routeConfidence === "real_itinerary") {
    return "Real itinerary";
  }

  if (isRealAwardResult(deal)) {
    return "Real cached award";
  }

  return "Simulated fallback";
};

export const getAwardScheduleText = (deal: FlightDealWithSource) => {
  if (deal.departureTime || deal.arrivalTime) {
    const departure = new Date(deal.departureTime);
    const arrival = new Date(deal.arrivalTime);

    const nextDay =
      arrival.getDate() !== departure.getDate();

    return `${
      formatAirportTime(deal.departureTime, deal.from) || "Time TBD"
    } → ${
      formatAirportTime(deal.arrivalTime, deal.to) || "Time TBD"
    }${nextDay ? " (+1 day)" : ""}`;
  }

  if (isRealAwardResult(deal)) {
    return "Schedule not available in cached data";
  }

  return `${formatAirportTime(deal.departureTime, deal.from) || "Time TBD"} → ${
    formatAirportTime(deal.arrivalTime, deal.to) || "Time TBD"
  }`;
};

export const getAwardRouteTypeText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal) && deal.stops && deal.stops !== "Stops unknown") {
    if (deal.stops === "Nonstop") return "Nonstop";
    if (deal.stopCity) return `${deal.stops} via ${deal.stopCity}`;
    return deal.stops;
  }

  if (isRealAwardResult(deal)) {
    return "Stops unknown — confirm before booking";
  }

  if (deal.stops === "Nonstop") return "Simulated nonstop";
  if (deal.stopCity) return `Simulated 1 stop via ${deal.stopCity}`;
  return "Simulated connection";
};

export const getAwardDurationText = (deal: FlightDealWithSource) => {
  if (deal.duration) return deal.duration;
  if (isRealAwardResult(deal)) return "Duration not available";
  return "Duration TBD";
};