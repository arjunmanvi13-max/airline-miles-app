
import { airports } from "./airports";
export { airports };

export type Airport = {
  code: string;
  name: string;
  region: string;
  metro?: string;
};

export type AirlineData = {
  name: string;
  program: string;
  baseMiles: number;
  tax: number;
  routes: string[];
};

export type RouteAirline = {
  from: string;
  to: string;
  airlines: string[];
};

export type TransferPartner = {
  card: string;
  airlineMatch: string;
  program: string;
  ratio: number;
  dataStatus: "real" | "placeholder";
};
export const airlines: AirlineData[] = [
  { name: "Delta Air Lines", program: "Amex", baseMiles: 32000, tax: 5.6, routes: ["domestic", "transatlantic"] },
  { name: "JetBlue", program: "Amex", baseMiles: 18000, tax: 5.6, routes: ["domestic", "transatlantic"] },
  { name: "Air France / KLM", program: "Amex", baseMiles: 22000, tax: 80, routes: ["transatlantic", "europe", "asia"] },
  { name: "Virgin Atlantic", program: "Amex", baseMiles: 24000, tax: 45, routes: ["transatlantic"] },
  { name: "Air Canada", program: "Amex", baseMiles: 26000, tax: 42, routes: ["domestic", "transatlantic", "asia"] },
  { name: "Emirates", program: "Amex", baseMiles: 36000, tax: 95, routes: ["middleEast", "asia"] },
  { name: "ANA", program: "Amex", baseMiles: 35000, tax: 55, routes: ["asia"] },
  { name: "Singapore Airlines", program: "Amex", baseMiles: 38000, tax: 60, routes: ["asia"] },
  { name: "British Airways", program: "Amex", baseMiles: 26000, tax: 120, routes: ["transatlantic", "europe"] },
  { name: "Aer Lingus", program: "Amex", baseMiles: 24000, tax: 85, routes: ["transatlantic", "europe"] },
  { name: "Avianca", program: "Capital One", baseMiles: 27000, tax: 45, routes: ["domestic", "transatlantic"] },
  { name: "Cathay Pacific", program: "Capital One", baseMiles: 36000, tax: 70, routes: ["asia"] },
  { name: "Etihad", program: "Capital One", baseMiles: 37000, tax: 90, routes: ["middleEast", "asia"] },
  { name: "Qantas", program: "Capital One", baseMiles: 40000, tax: 80, routes: ["asia"] },

  { name: "United Airlines", program: "Chase", baseMiles: 25000, tax: 5.6, routes: ["domestic", "transatlantic", "asia"] },
  { name: "Southwest Airlines", program: "Chase", baseMiles: 16000, tax: 5.6, routes: ["domestic"] },

  { name: "American Airlines", program: "Bilt", baseMiles: 30000, tax: 11.2, routes: ["domestic", "transatlantic", "asia"] },
  { name: "Alaska Airlines", program: "Bilt", baseMiles: 28000, tax: 11.2, routes: ["domestic", "asia"] },

  { name: "Turkish Airlines", program: "Capital One", baseMiles: 28000, tax: 65, routes: ["transatlantic", "europe", "asia", "middleEast"] },
  { name: "Qatar Airways", program: "Capital One", baseMiles: 34000, tax: 90, routes: ["middleEast", "asia", "transatlantic"] },
];

export const routeAirlines: RouteAirline[] = [
  {
    from: "JFK",
    to: "LHR",
    airlines: [
      "British Airways",
      "Virgin Atlantic",
      "American Airlines",
      "Delta Air Lines",
      "JetBlue",
    ],
  },
  {
    from: "EWR",
    to: "LHR",
    airlines: ["United Airlines", "British Airways", "Virgin Atlantic"],
  },
  {
    from: "BOS",
    to: "LHR",
    airlines: ["British Airways", "Virgin Atlantic", "American Airlines", "Delta Air Lines"],
  },
  {
    from: "JFK",
    to: "CDG",
    airlines: ["Air France / KLM", "Delta Air Lines", "JetBlue"],
  },
  {
    from: "EWR",
    to: "CDG",
    airlines: ["United Airlines", "Air France / KLM"],
  },
  {
    from: "IAD",
    to: "CDG",
    airlines: ["United Airlines", "Air France / KLM"],
  },
  {
    from: "JFK",
    to: "AMS",
    airlines: ["Air France / KLM", "Delta Air Lines", "JetBlue"],
  },
  {
    from: "EWR",
    to: "AMS",
    airlines: ["United Airlines"],
  },
  {
    from: "JFK",
    to: "FRA",
    airlines: ["United Airlines", "Delta Air Lines"],
  },
  {
    from: "EWR",
    to: "FRA",
    airlines: ["United Airlines"],
  },
  {
    from: "JFK",
    to: "MAD",
    airlines: ["American Airlines", "British Airways"],
  },
  {
    from: "JFK",
    to: "FCO",
    airlines: ["Delta Air Lines", "American Airlines"],
  },
  {
    from: "JFK",
    to: "DUB",
    airlines: ["Aer Lingus", "Delta Air Lines"],
  },

  {
    from: "LAX",
    to: "NRT",
    airlines: ["ANA", "Singapore Airlines", "United Airlines", "American Airlines"],
  },
  {
    from: "LAX",
    to: "HND",
    airlines: ["ANA", "United Airlines", "Delta Air Lines", "American Airlines"],
  },
  {
    from: "SFO",
    to: "NRT",
    airlines: ["ANA", "United Airlines"],
  },
  {
    from: "SFO",
    to: "HND",
    airlines: ["ANA", "United Airlines"],
  },
  {
    from: "SEA",
    to: "NRT",
    airlines: ["ANA", "Delta Air Lines"],
  },
  {
    from: "LAX",
    to: "SIN",
    airlines: ["Singapore Airlines", "United Airlines"],
  },
  {
    from: "SFO",
    to: "SIN",
    airlines: ["Singapore Airlines", "United Airlines"],
  },
  {
    from: "JFK",
    to: "SIN",
    airlines: ["Singapore Airlines"],
  },
  {
    from: "JFK",
    to: "DEL",
    airlines: ["Air Canada", "Emirates", "Qatar Airways"],
  },
  {
    from: "EWR",
    to: "DEL",
    airlines: ["United Airlines", "Air Canada", "Emirates"],
  },
  {
    from: "JFK",
    to: "DXB",
    airlines: ["Emirates"],
  },
  {
    from: "EWR",
    to: "DXB",
    airlines: ["United Airlines", "Emirates"],
  },
  {
    from: "JFK",
    to: "DOH",
    airlines: ["Qatar Airways"],
  },

  {
    from: "JFK",
    to: "LAX",
    airlines: ["Delta Air Lines", "JetBlue", "American Airlines"],
  },
  {
    from: "EWR",
    to: "LAX",
    airlines: ["United Airlines", "JetBlue"],
  },
  {
    from: "LGA",
    to: "ORD",
    airlines: ["United Airlines", "American Airlines", "Delta Air Lines"],
  },
  {
    from: "JFK",
    to: "SFO",
    airlines: ["Delta Air Lines", "JetBlue", "American Airlines"],
  },
  {
    from: "EWR",
    to: "SFO",
    airlines: ["United Airlines", "Alaska Airlines"],
  },
  {
    from: "MIA",
    to: "ORD",
    airlines: ["American Airlines", "United Airlines"],
  },
  {
    from: "DFW",
    to: "LAX",
    airlines: ["American Airlines", "Delta Air Lines"],
  },
  {
    from: "ATL",
    to: "LAX",
    airlines: ["Delta Air Lines", "Southwest Airlines"],
  },
];

export const transferPartners: TransferPartner[] = [
  // Amex Membership Rewards®
  { card: "Amex", airlineMatch: "Aer Lingus", program: "AerClub Avios®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Aeromexico", program: "Aeromexico Rewards®", ratio: 1.6, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Air Canada", program: "Aeroplan®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "ANA", program: "ANA Mileage Club®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Avianca", program: "LifeMiles®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "British Airways", program: "Executive Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Cathay Pacific", program: "Asia Miles®", ratio: 0.8, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Delta", program: "SkyMiles®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Emirates", program: "Skywards®", ratio: 0.8, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Etihad", program: "Etihad Guest®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Iberia", program: "Iberia Plus Avios®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "JetBlue", program: "TrueBlue®", ratio: 0.8, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Qantas", program: "Qantas Frequent Flyer®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Qatar", program: "Privilege Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Singapore", program: "KrisFlyer®", ratio: 1, dataStatus: "real" },
  { card: "Amex", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },

  // Chase Ultimate Rewards®
  { card: "Chase", airlineMatch: "Aer Lingus", program: "AerClub Avios®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Air Canada", program: "Aeroplan®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "British Airways", program: "Executive Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Iberia", program: "Iberia Plus Avios®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "JetBlue", program: "TrueBlue®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Singapore", program: "KrisFlyer®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Southwest", program: "Rapid Rewards®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "United", program: "MileagePlus®", ratio: 1, dataStatus: "real" },
  { card: "Chase", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },

  // Capital One Miles
  { card: "Capital One", airlineMatch: "Aeromexico", program: "Aeromexico Rewards®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Air Canada", program: "Aeroplan®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Avianca", program: "LifeMiles®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "British Airways", program: "Executive Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Cathay Pacific", program: "Asia Miles®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Emirates", program: "Skywards®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Etihad", program: "Etihad Guest®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "EVA", program: "Infinity MileageLands®", ratio: 0.75, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Finnair", program: "Finnair Plus®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Japan Airlines", program: "Mileage Bank®", ratio: 0.75, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "JetBlue", program: "TrueBlue®", ratio: 0.6, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Qantas", program: "Qantas Frequent Flyer®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Qatar", program: "Privilege Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Singapore", program: "KrisFlyer®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "TAP", program: "Miles&Go®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Turkish", program: "Miles&Smiles®", ratio: 1, dataStatus: "real" },
  { card: "Capital One", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },

  // Bilt Rewards®
  { card: "Bilt", airlineMatch: "Alaska", program: "Mileage Plan®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "American", program: "AAdvantage®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Air Canada", program: "Aeroplan®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Avianca", program: "LifeMiles®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "British Airways", program: "Executive Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Cathay Pacific", program: "Asia Miles®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Emirates", program: "Skywards®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Etihad", program: "Etihad Guest®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Iberia", program: "Iberia Plus Avios®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Japan Airlines", program: "Mileage Bank®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Qatar", program: "Privilege Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Singapore", program: "KrisFlyer®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Southwest", program: "Rapid Rewards®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "TAP", program: "Miles&Go®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Turkish", program: "Miles&Smiles®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "United", program: "MileagePlus®", ratio: 1, dataStatus: "real" },
  { card: "Bilt", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },

  // Citi ThankYou®
  { card: "Citi", airlineMatch: "Aeromexico", program: "Aeromexico Rewards®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "American", program: "AAdvantage®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Avianca", program: "LifeMiles®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Cathay Pacific", program: "Asia Miles®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Emirates", program: "Skywards®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Etihad", program: "Etihad Guest®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "EVA", program: "Infinity MileageLands®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "JetBlue", program: "TrueBlue®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Qantas", program: "Qantas Frequent Flyer®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Qatar", program: "Privilege Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Singapore", program: "KrisFlyer®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Thai", program: "Royal Orchid Plus®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Turkish", program: "Miles&Smiles®", ratio: 1, dataStatus: "real" },
  { card: "Citi", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },

  // Wells Fargo Rewards®
  { card: "Wells Fargo", airlineMatch: "Aer Lingus", program: "AerClub Avios®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "Air France", program: "Flying Blue®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "Avianca", program: "LifeMiles®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "British Airways", program: "Executive Club Avios®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "Cathay Pacific", program: "Asia Miles®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "Iberia", program: "Iberia Plus Avios®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "JetBlue", program: "TrueBlue®", ratio: 1, dataStatus: "real" },
  { card: "Wells Fargo", airlineMatch: "Virgin Atlantic", program: "Flying Club®", ratio: 1, dataStatus: "real" },
];

export const prototypeTransferBonuses = [
  { card: "Amex", program: "Flying Blue®", bonusPercent: 20 },
  { card: "Amex", program: "Flying Club®", bonusPercent: 30 },
];

export const realTransferDataCards = ["Amex", "Chase", "Capital One", "Bilt"];
export const cardEcosystems = [
  {
    name: "Amex",
    pointsName: "Membership Rewards®",
    logoPath: "/logos/cards/amex.svg",
    cards: ["Platinum Card®", "Gold Card®", "Green Card®", "Business Platinum Card®", "Business Gold Card®"],
  },
  {
    name: "Chase",
    pointsName: "Ultimate Rewards®",
    logoPath: "/logos/cards/chase.svg",
    cards: ["Sapphire Preferred®", "Sapphire Reserve®", "Ink Business Preferred®", "Freedom Flex®", "Freedom Unlimited®"],
  },
  {
    name: "Capital One",
    pointsName: "Capital One Miles",
    logoPath: "/logos/cards/capital-one.svg",
    cards: ["Venture X", "Venture Rewards", "VentureOne", "Spark Miles"],
  },
  {
    name: "Bilt",
    pointsName: "Bilt Rewards®",
    logoPath: "/logos/cards/bilt.svg",
    cards: ["Bilt Mastercard®"],
  },
  {
    name: "Citi",
    pointsName: "ThankYou® Points",
    logoPath: "/logos/cards/citi.svg",
    cards: ["Strata Premier℠", "Strata Elite℠", "Premier® Card"],
  },
  {
    name: "Wells Fargo",
    pointsName: "Wells Fargo Rewards®",
    logoPath: "/logos/cards/wells-fargo.svg",
    cards: ["Autograph®", "Autograph Journey℠", "Active Cash® with Autograph transfer access"],
  },
];