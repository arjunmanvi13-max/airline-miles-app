import {
  getBookingDecision,
  getRedemptionLabel,
  getRedemptionReasons,
  getRedemptionScore,
  getTransferOptions,
  getWalletFitLabel,
  getWalletFitScore,
  type FlightDeal,
} from "../../logic";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const parseNumber = (value: unknown) => {
  const cleaned = String(value || "").replace(/[$,]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const card = String(body.card || "Amex");
    const balance = String(body.balance || "");
    const passengers = Math.max(1, Number(body.passengers || 1));

    const miles = parseNumber(body.miles);
    const taxes = parseNumber(body.taxes);
    const cabin = String(body.cabin || "Economy");

    let cashPrice = parseNumber(body.cashPrice);
    let cashLookup = null;

    if (!cashPrice && body.origin && body.destination && body.departureDate) {
      const cashResponse = await fetch(
        new URL("/api/duffel-cash-price", request.url),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  origin: body.origin,
  destination: body.destination,
  departureDate: body.departureDate,
  cabin,
  passengers,
  airline: body.airline || "",
  flightNumber: body.flightNumber || "",
  departureTime: body.departureTime || "",
  arrivalTime: body.arrivalTime || "",
  isNonstop: Boolean(body.isNonstop),
}),
        }
      );

      const cashData = await cashResponse.json();
      cashLookup = cashData;

      if (cashResponse.ok && cashData.cashPrice) {
        cashPrice = parseNumber(cashData.cashPrice);
      }
    }

    const deal: FlightDeal = {
      airline: body.airline || "",
      transferAirlineMatch: body.airline || body.program || "",
      program: body.program || "",
      miles,
      taxes,
      estimatedCashPrice: cashPrice,
      from: body.origin || "N/A",
      to: body.destination || "N/A",
      date: body.departureDate || "N/A",
      stops: body.isNonstop ? "Nonstop" : body.stops || "Unknown",
      cabin,
      score: 0,
      tag: "Seats.aero",
      routeDataSource: "specific route",
      departureTime: body.departureTime || "",
      arrivalTime: body.arrivalTime || "",
      duration: "",
      aircraft: "",
      flightNumber: body.flightNumber || "",
      segments: [],
    };

    const selectedCards = [card];
    const applyTransferBonuses = true;

    const transferOptions = getTransferOptions(
      deal,
      selectedCards,
      applyTransferBonuses
    );

    const bestOption = transferOptions.length > 0 ? transferOptions[0] : null;

    const balanceNumber = balance.trim()
      ? Number(balance.replace(/,/g, ""))
      : null;

    const requiredPoints = bestOption ? bestOption.requiredCardPoints : miles;

    const canBook =
      balanceNumber !== null && requiredPoints > 0
        ? balanceNumber >= requiredPoints
        : false;

    const shortage =
      balanceNumber !== null
        ? Math.max(0, requiredPoints - balanceNumber)
        : 0;

    const centsPerPoint =
      cashPrice > 0 && miles > 0 ? ((cashPrice - taxes) / miles) * 100 : null;

    const redemptionScore = getRedemptionScore({
      miles,
      taxes,
      cashPrice,
      cabin,
    });

    const walletFitScore = getWalletFitScore({
      requiredPoints,
      balance: balanceNumber,
    });

    const bookingDecision = getBookingDecision({
      redemptionScore,
      walletFitScore,
      canBook,
      centsPerPoint,
    });

    return Response.json(
      {
        ...body,
        passengers,
        miles,
        taxes,
        cashPrice,
        centsPerPoint,
        redemptionScore,
        redemptionLabel:
          redemptionScore !== null ? getRedemptionLabel(redemptionScore) : null,
        redemptionReasons: getRedemptionReasons({
          miles,
          taxes,
          cashPrice,
          cabin,
        }),
        cashLookup,
        wallet: {
          card,
          balance: balanceNumber,
          requiredPoints,
          canBook,
          shortage,
          fitScore: walletFitScore,
          fitLabel: getWalletFitLabel(walletFitScore),
        },
        transfer: bestOption
          ? {
              card: bestOption.card,
              program: bestOption.program,
              requiredCardPoints: bestOption.requiredCardPoints,
              bonusPercent: bestOption.bonusPercent,
            }
          : null,
        bookingDecision,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Structured award analysis failed:", error);

    const message =
      error instanceof Error ? error.message : "Structured award analysis failed.";

    return Response.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}