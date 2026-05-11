import { FlightDealWithSource } from "@/app/adapters";

export const isRealAwardResult = (deal: FlightDealWithSource) =>
  deal.dataSource === "seats_aero_cached";

export const isSimulatedAwardResult = (deal: FlightDealWithSource) =>
  !isRealAwardResult(deal);

export const getAwardSourceLabel = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) return "Real cached award";
  return "Simulated fallback";
};

export const getAwardScheduleText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) return "Schedule not available in cached data";

  return `${deal.departureTime || "Time TBD"} → ${
    deal.arrivalTime || "Time TBD"
  }`;
};

export const getAwardRouteTypeText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) {
    return "Stops unknown — confirm before booking";
  }

  if (deal.stops === "Nonstop") return "Simulated nonstop";
  if (deal.stopCity) return `Simulated 1 stop via ${deal.stopCity}`;
  return "Simulated connection";
};

export const getAwardDurationText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) return "Duration not available";
  return deal.duration || "Duration TBD";
};