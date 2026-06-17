

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
    const incomingFormData = await request.formData();

    const screenshot = incomingFormData.get("screenshot");
    const card = String(incomingFormData.get("card") || "Amex");
    const balance = String(incomingFormData.get("balance") || "");

    const userCabin = String(
  incomingFormData.get("cabin") || ""
);

const userPassengers = Number(
  incomingFormData.get("passengers") || 1
);

    if (!(screenshot instanceof File)) {
  return Response.json(
    { error: "No screenshot uploaded." },
    { status: 400, headers: corsHeaders }
  );
}

    const extractionFormData = new FormData();
    extractionFormData.append("screenshot", screenshot);

    const extractionResponse = await fetch(
  new URL("/api/analyze-award-screenshot", request.url),
  {
    method: "POST",
    body: extractionFormData,
  }
);

    const extracted = await extractionResponse.json();

    if (!extractionResponse.ok) {
      return Response.json(extracted, {
  status: extractionResponse.status,
  headers: corsHeaders,
});
    }

    const miles = parseNumber(extracted.miles);
const taxes = parseNumber(extracted.taxes);
const cabin =
  extracted.cabin ||
  userCabin ||
  "Economy";

let cashPrice = parseNumber(extracted.cashPrice);
let cashLookup = null;

if (!cashPrice && extracted.origin && extracted.destination && extracted.departureDate) {

  
  const cashResponse = await fetch(
    new URL("/api/duffel-cash-price", request.url),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: extracted.origin,
        destination: extracted.destination,
        departureDate: extracted.departureDate,
        cabin,
        passengers:
  extracted.passengers ||
  userPassengers ||
  1,
        airline: extracted.airline || "",
        flightNumber: extracted.flightNumber || "",
        isNonstop: Boolean(extracted.isNonstop),
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
      airline: extracted.airline || "",
      transferAirlineMatch: extracted.airline || extracted.program || "",
      program: extracted.program || "",
      miles,
      taxes,
      estimatedCashPrice: cashPrice,
      from: extracted.origin || "N/A",
      to: extracted.destination || "N/A",
      date: extracted.departureDate || "N/A",
      stops: extracted.isNonstop ? "Nonstop" : "Unknown",
      cabin,
      score: 0,
      tag: "Analyzer",
      routeDataSource: "specific route",
      departureTime: extracted.departureTime || "",
      arrivalTime: extracted.arrivalTime || "",
      duration: "",
      aircraft: "",
      flightNumber: extracted.flightNumber || "",
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
    ...extracted,
    cabin,
    passengers: extracted.passengers || userPassengers || 1,
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
    console.error("Extension analysis failed:", error);

    const message =
      error instanceof Error ? error.message : "Extension analysis failed.";

    return Response.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}