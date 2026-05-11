import { FlightDealWithSource } from "@/app/adapters";

export const isRealAwardResult = (deal: FlightDealWithSource) =>
  deal.dataSource === "seats_aero_cached";

export const getAwardScheduleText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) return "Schedule details pending";

  return `${deal.departureTime || "Time TBD"} → ${
    deal.arrivalTime || "Time TBD"
  }`;
};

export const getAwardRouteTypeText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) {
    return deal.stops === "Direct award result"
      ? "Direct award result"
      : "May include connections";
  }

  if (deal.stops === "Nonstop") return "Nonstop";
  if (deal.stopCity) return `1 stop via ${deal.stopCity}`;
  return "1 stop";
};

export const getAwardDurationText = (deal: FlightDealWithSource) => {
  if (isRealAwardResult(deal)) return "Schedule TBD";
  return deal.duration || "Duration TBD";
};