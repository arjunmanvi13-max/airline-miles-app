import { Duffel } from "@duffel/api";

export const runtime = "nodejs";

const normalizeCabin = (cabin: string) => {
  if (cabin === "Premium Economy") return "premium_economy";
  if (cabin === "Business") return "business";
  if (cabin === "First") return "first";
  return "economy";
};

const normalizeText = (value: unknown) =>
  String(value || "").toLowerCase().trim();

const getSegments = (offer: any) => offer.slices?.[0]?.segments || [];

const getOfferAirlineText = (offer: any) =>
  getSegments(offer)
    .map((segment: any) => segment.marketing_carrier?.name || "")
    .join(" ")
    .toLowerCase();

const getOfferFlightNumbers = (offer: any) =>
  getSegments(offer)
    .map((segment: any) => {
      const code = segment.marketing_carrier?.iata_code || "";
      const number = segment.marketing_carrier_flight_number || "";
      return `${code}${number}`.replace(/\s/g, "").toLowerCase();
    })
    .filter(Boolean);

const scoreOffer = ({
  offer,
  targetAirline,
  targetFlightNumber,
  targetIsNonstop,
}: {
  offer: any;
  targetAirline: string;
  targetFlightNumber: string;
  targetIsNonstop: boolean;
}) => {
  let score = 0;

  const segments = getSegments(offer);
  const airlineText = getOfferAirlineText(offer);
  const flightNumbers = getOfferFlightNumbers(offer);

  const cleanTargetAirline = normalizeText(targetAirline);
  const cleanTargetFlightNumber = targetFlightNumber
    .replace(/\s/g, "")
    .toLowerCase();

  if (
    cleanTargetFlightNumber &&
    flightNumbers.some((flight: string) =>
      flight.includes(cleanTargetFlightNumber)
    )
  ) {
    score += 100;
  }

  if (cleanTargetAirline && airlineText.includes(cleanTargetAirline)) {
    score += 50;
  }

  if (targetIsNonstop && segments.length === 1) {
    score += 30;
  }

  return score;
};

const serializeOffer = (offer: any, matchScore: number) => {
  const segments = getSegments(offer);
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  return {
    offerId: offer.id,
    cashPrice: offer.total_amount,
    currency: offer.total_currency,
    matchScore,
    airline:
      offer.owner?.name ||
      firstSegment?.marketing_carrier?.name ||
      "",
    flightNumber:
      firstSegment?.marketing_carrier_flight_number || "",
    origin: firstSegment?.origin?.iata_code || "",
    destination: lastSegment?.destination?.iata_code || "",
    departureTime: firstSegment?.departing_at || "",
    arrivalTime: lastSegment?.arriving_at || "",
    stops:
      segments.length <= 1
        ? "Nonstop"
        : `${segments.length - 1} stop${
            segments.length - 1 === 1 ? "" : "s"
          }`,
    segments: segments.map((segment: any) => ({
      airline: segment.marketing_carrier?.name || "",
      airlineCode: segment.marketing_carrier?.iata_code || "",
      flightNumber: segment.marketing_carrier_flight_number || "",
      from: segment.origin?.iata_code || "",
      to: segment.destination?.iata_code || "",
      departingAt: segment.departing_at || "",
      arrivingAt: segment.arriving_at || "",
    })),
  };
};

export async function POST(request: Request) {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      return Response.json(
        { error: "Missing DUFFEL_ACCESS_TOKEN in .env.local" },
        { status: 500 }
      );
    }

    const duffel = new Duffel({ token });
    const body = await request.json();

    const origin = String(body.origin || "").toUpperCase();
    const destination = String(body.destination || "").toUpperCase();
    const departureDate = String(body.departureDate || "");
    const cabin = normalizeCabin(String(body.cabin || "Economy"));
    const passengersCount = Math.max(1, Number(body.passengers || 1));

    const targetAirline = String(body.airline || "");
    const targetFlightNumber = String(body.flightNumber || "");
    const targetIsNonstop = Boolean(body.isNonstop);

    if (!origin || !destination || !departureDate) {
      return Response.json(
        { error: "Origin, destination, and departure date are required." },
        { status: 400 }
      );
    }

    const passengers = Array.from({ length: passengersCount }, () => ({
      type: "adult" as const,
    }));

    const offerRequestPayload: any = {
      slices: [
        {
          origin,
          destination,
          departure_date: departureDate,
          departure_time: null,
          arrival_time: null,
        },
      ],
      passengers,
      cabin_class: cabin,
    };

    if (targetIsNonstop) {
      offerRequestPayload.max_connections = 0;
    }

    const offerRequest = await duffel.offerRequests.create(
      offerRequestPayload
    );

    const offersResponse = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
    });

    const offers = offersResponse.data || [];

    if (offers.length === 0 && targetIsNonstop) {
  const fallbackOfferRequest = await duffel.offerRequests.create({
    slices: [
      {
        origin,
        destination,
        departure_date: departureDate,
        departure_time: null,
        arrival_time: null,
      },
    ],
    passengers,
    cabin_class: cabin,
  });

  const fallbackOffersResponse = await duffel.offers.list({
    offer_request_id: fallbackOfferRequest.data.id,
  });

  const fallbackOffers = fallbackOffersResponse.data || [];

  if (fallbackOffers.length > 0) {
    const rankedFallbackOffers = [...fallbackOffers]
      .map((offer: any) => ({
        offer,
        matchScore: scoreOffer({
          offer,
          targetAirline,
          targetFlightNumber,
          targetIsNonstop: false,
        }),
      }))
      .sort((a: any, b: any) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

        return (
          Number(a.offer.total_amount || 0) -
          Number(b.offer.total_amount || 0)
        );
      });

    const cashOptions = rankedFallbackOffers
      .slice(0, 8)
      .map((item: any) => serializeOffer(item.offer, item.matchScore));

    const selected = rankedFallbackOffers[0];
    const serialized = serializeOffer(selected.offer, selected.matchScore);

    return Response.json({
      ...serialized,
      source: "duffel_live_offers",
      confidence: "fallback_comparable_with_connections",
      needsSelection: false,
      cashOptions,
      liveMode: selected.offer.live_mode,
      message:
        "No nonstop cash fare found, so Vantara used the closest comparable Duffel fare.",
    });
  }
}

if (offers.length === 0) {
  return Response.json({
    cashPrice: "",
    source: "duffel_live_offers",
    confidence: "none",
    needsSelection: false,
    cashOptions: [],
    message: "No Duffel cash offers found for this route/date.",
  });
}

    const rankedOffers = [...offers]
      .map((offer: any) => ({
        offer,
        matchScore: scoreOffer({
          offer,
          targetAirline,
          targetFlightNumber,
          targetIsNonstop,
        }),
      }))
      .sort((a: any, b: any) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

        return (
          Number(a.offer.total_amount || 0) -
          Number(b.offer.total_amount || 0)
        );
      });

    const cashOptions = rankedOffers
      .filter((item: any) => item.matchScore > 0)
      .slice(0, 8)
      .map((item: any) => serializeOffer(item.offer, item.matchScore));

    const selected = rankedOffers[0];
    const serialized = serializeOffer(selected.offer, selected.matchScore);

    const hasExactFlightMatch =
      targetFlightNumber && selected.matchScore >= 100;

    const shouldUserSelect =
      !targetFlightNumber && cashOptions.length > 1;

    if (shouldUserSelect) {
      return Response.json({
        cashPrice: "",
        currency: "",
        source: "duffel_live_offers",
        confidence: "user_selection_required",
        needsSelection: true,
        cashOptions,
        message:
          "Multiple matching cash flights found. Ask the user to select the matching flight.",
      });
    }

    let confidence = "cheapest_comparable";

    if (hasExactFlightMatch) {
      confidence = "exact_flight_or_number_match";
    } else if (selected.matchScore >= 80) {
      confidence = "same_airline_nonstop";
    } else if (selected.matchScore >= 50) {
      confidence = "same_airline_comparable";
    } else if (targetIsNonstop && serialized.stops === "Nonstop") {
      confidence = "nonstop_comparable";
    }

    return Response.json({
      ...serialized,
      source: "duffel_live_offers",
      confidence,
      needsSelection: false,
      cashOptions,
      liveMode: selected.offer.live_mode,
      message:
        confidence === "cheapest_comparable"
          ? "Cheapest comparable Duffel cash offer found."
          : "Matched Duffel cash offer found.",
    });
  } catch (error) {
    console.error("Duffel cash price lookup failed:", error);

    const message =
      error instanceof Error ? error.message : "Duffel cash price lookup failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}