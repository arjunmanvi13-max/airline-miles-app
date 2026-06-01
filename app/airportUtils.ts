import { airports, type Airport } from "./airports";

const excludedNameWords = [
  "air force",
  "afb",
  "army",
  "naval",
  "military",
  "base",
  "private",
  "heliport",
  "seaplane",
  "navy",
  "marine corps",
  "coast guard",
  "test facility",
  "airfield",
  "space force",
  "joint base",
  "boeing field",
  "king county international",
];

const passengerAirportNameWords = [
  "international",
  "regional",
  "municipal",
  "airport",
  "intercontinental",
];

const knownPassengerAirports = new Set([
  "SEA",
  "PAE",
  "TPA",
  "MCO",
  "MIA",
  "FLL",
  "JFK",
  "EWR",
  "LGA",
  "BOS",
  "ORD",
  "DFW",
  "ATL",
  "LAX",
  "SFO",
  "DEN",
  "IAD",
  "DCA",
  "PHL",
  "CLT",
  "IAH",
  "PHX",
  "LAS",
  "SAN",
  "HND",
  "NRT",
  "LHR",
  "LGW",
  "CDG",
  "AMS",
  "FRA",
  "DEL",
]);

const explicitlyExcludedAirports = new Set([
  "BFI", // Boeing Field / King County International
  "MCF", // MacDill Air Force Base
]);

export const isCommercialAirport = (airport: Airport) => {
  const name = airport.name.toLowerCase();

  if (explicitlyExcludedAirports.has(airport.code)) return false;

  const usableType =
    airport.type === "large_airport" || airport.type === "medium_airport";

  const blockedByName = excludedNameWords.some((word) => name.includes(word));

  const likelyPassengerAirport =
    knownPassengerAirports.has(airport.code) ||
    passengerAirportNameWords.some((word) => name.includes(word));

  return usableType && !blockedByName && likelyPassengerAirport;
};

export const getAirportSearchPriority = (airport: Airport) => {
  let score = 0;

  if (airport.type === "large_airport") score += 100;
  if (airport.type === "medium_airport") score += 50;

  if (knownPassengerAirports.has(airport.code)) score += 100;

  const name = airport.name.toLowerCase();

  if (name.includes("international")) score += 30;
  if (name.includes("regional")) score += 15;

  return score;
};

export const commercialAirports = airports
  .filter(isCommercialAirport)
  .sort((a, b) => getAirportSearchPriority(b) - getAirportSearchPriority(a));

const milesBetween = (a: Airport, b: Airport) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
};

export const getNearbyCommercialAirportCodes = (
  airportCode: string,
  radiusMiles = 250,
  maxResults = 5
) => {
  const origin = commercialAirports.find(
    (airport) => airport.code === airportCode
  );

  if (!origin) return [airportCode];

  return commercialAirports
    .map((airport) => ({
      airport,
      distance: milesBetween(origin, airport),
      priority: getAirportSearchPriority(airport),
    }))
    .filter((item) => item.distance <= radiusMiles)
    .sort((a, b) => {
      if (a.airport.code === airportCode) return -1;
      if (b.airport.code === airportCode) return 1;

      if (a.airport.type !== b.airport.type) {
        return b.priority - a.priority;
      }

      return a.distance - b.distance;
    })
    .slice(0, maxResults)
    .map((item) => item.airport.code);
};