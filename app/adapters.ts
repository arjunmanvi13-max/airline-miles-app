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

export type FlightDataSource =
  | "placeholder"
  | "cached_award_api"
  | "live_award_api"
  | "cash_api";

export type FlightDealWithSource = FlightDeal & {
  dataSource: FlightDataSource;
  dataNote: string;
};

export const searchFlightDeals = async (
  input: SearchFlightDealsInput
): Promise<FlightDealWithSource[]> => {
  const deals = generateRealisticDeals({
    from: input.from,
    to: input.to,
    date: input.departureDate,
    cabin: input.cabin,
    flexibleDates: input.flexibleDates,
    selectedCards: input.selectedCards,
    includeNearbyAirports: input.includeNearbyAirports,
    applyTransferBonuses: input.applyTransferBonuses,
  });

  return deals.map((deal) => ({
    ...deal,
    dataSource: "placeholder",
    dataNote:
      "Placeholder award and cash data. Transfer ratios and airport database are structured for real API integration.",
  }));
};