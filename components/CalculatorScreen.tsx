"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getTransferOptions,
  getRedemptionScore,
  getRedemptionLabel,
  getRedemptionReasons,
  getWalletFitScore,
  getWalletFitLabel,
  getBookingDecision,
  getPreservePointsAdvice,
  getWalletRecommendationText,
} from "@/app/logic";

type EntryMode = "Automatic" | "Manual";

type CashFlightOption = {
  offerId: string;
  cashPrice: string;
  currency: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  stops: string;
  matchScore: number;
};

export default function CalculatorScreen({
  selectedCards,
  applyTransferBonuses,
  pointBalances,
}: {
  selectedCards: string[];
  applyTransferBonuses: boolean;
  pointBalances: Record<string, string>;
}) {
  const [entryMode, setEntryMode] = useState<EntryMode>("Automatic");
  const [manualOverride, setManualOverride] = useState(false);

  const [airline, setAirline] = useState("");
  const [program, setProgram] = useState("");
  const [route, setRoute] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
const [flightNumber, setFlightNumber] = useState("");
const [isNonstop, setIsNonstop] = useState(false);


const [miles, setMiles] = useState("");
  const [taxes, setTaxes] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");

  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [isFindingCashPrice, setIsFindingCashPrice] = useState(false);
  const [cashPriceMessage, setCashPriceMessage] = useState("");

  const [cashFlightOptions, setCashFlightOptions] = useState<CashFlightOption[]>([]);

  const detailsLocked = entryMode === "Automatic" && !manualOverride;

  const parsedMiles = Number(miles.replace(/,/g, "")) || 0;
  const parsedTaxes = Number(taxes.replace(/,/g, "")) || 0;
  const parsedCash = Number(cashPrice.replace(/,/g, "")) || 0;
  const parsedPassengers = Math.max(1, passengers);

  const mockDeal = {
    airline,
    transferAirlineMatch: airline,
    program,
    miles: parsedMiles,
    taxes: parsedTaxes,
    estimatedCashPrice: parsedCash,
    from: origin || "N/A",
    to: destination || "N/A",
    date: departureDate || "N/A",
    stops: "Unknown",
    cabin,
    score: 0,
    tag: "Analyzer",
    routeDataSource: "specific route" as const,
    departureTime: "",
    arrivalTime: "",
    duration: "",
    aircraft: "",
    segments: [],
  };

  const transferOptions = useMemo(() => {
    if (!airline || !parsedMiles) return [];

    return getTransferOptions(mockDeal, selectedCards, applyTransferBonuses);
  }, [
    airline,
    program,
    parsedMiles,
    parsedTaxes,
    parsedCash,
    cabin,
    selectedCards,
    applyTransferBonuses,
  ]);

  const totalMilesNeeded = parsedMiles * parsedPassengers;

  const centsPerPoint =
    parsedCash > 0 && parsedMiles > 0
      ? ((parsedCash - parsedTaxes) / parsedMiles) * 100
      : null;

  const redemptionScore = getRedemptionScore({
    miles: parsedMiles,
    taxes: parsedTaxes,
    cashPrice: parsedCash,
    cabin,
  });

  const redemptionLabel =
    redemptionScore !== null ? getRedemptionLabel(redemptionScore) : null;

  const redemptionReasons = getRedemptionReasons({
    miles: parsedMiles,
    taxes: parsedTaxes,
    cashPrice: parsedCash,
    cabin,
  });

  const cppLabel =
    centsPerPoint === null
      ? null
      : centsPerPoint >= 1.8
      ? "Excellent"
      : centsPerPoint >= 1.3
      ? "Good"
      : "Weak";

  const bestOption = transferOptions.length > 0 ? transferOptions[0] : null;

  const bestOptionTotal = bestOption
    ? bestOption.requiredCardPoints * parsedPassengers
    : 0;

  const bestBalanceRaw = bestOption ? pointBalances[bestOption.card] : "";

  const bestBalance =
    bestBalanceRaw && bestBalanceRaw.trim() !== ""
      ? Number(bestBalanceRaw.replace(/,/g, ""))
      : null;

  const bestCanBook =
    bestBalance !== null && bestBalance >= bestOptionTotal;

  const bestShortage =
    bestBalance !== null ? Math.max(0, bestOptionTotal - bestBalance) : 0;

  const walletFitScore = getWalletFitScore({
    requiredPoints: bestOptionTotal,
    balance: bestBalance,
  });

  const walletFitLabel = getWalletFitLabel(walletFitScore);

  const bookingDecision = getBookingDecision({
    redemptionScore,
    walletFitScore,
    canBook: bestCanBook,
    centsPerPoint,
  });

  const preservePointsAdvice = getPreservePointsAdvice({
    bestCard: bestOption ? bestOption.card : null,
    selectedCards,
  });

  const handleScreenshotUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setExtractionError("");
    setCashPriceMessage("");

    setCashFlightOptions([]);
  };

  const updatePassengers = (change: number) => {
    setPassengers((current) => Math.max(1, current + change));
  };

  const getRouteCodes = () => {
    const routeCodes = route.toUpperCase().match(/[A-Z]{3}/g);

    return {
      originCode: origin || routeCodes?.[0] || "",
      destinationCode: destination || routeCodes?.[1] || "",
    };
  };

  const selectCashFlightOption = (option: CashFlightOption) => {
  setCashPrice(String(option.cashPrice));
  setCashFlightOptions([]);
  setCashPriceMessage(
    `Selected matching cash flight: $${option.cashPrice} ${
      option.currency || ""
    } • ${option.airline || "Airline"} • ${option.stops || ""}`
  );
};

  const findCashPrice = async ({
  originCode,
  destinationCode,
  travelDate,
  matchAirline,
  matchFlightNumber,
  matchIsNonstop,
}: {
  originCode?: string;
  destinationCode?: string;
  travelDate?: string;
  matchAirline?: string;
  matchFlightNumber?: string;
  matchIsNonstop?: boolean;
}) => {
    const fallbackCodes = getRouteCodes();

    const finalOrigin = originCode || fallbackCodes.originCode;
    const finalDestination = destinationCode || fallbackCodes.destinationCode;
    const finalDate = travelDate || departureDate;

    if (!finalOrigin || !finalDestination || !finalDate) {
      setCashPriceMessage(
        "Add a route and departure date to estimate a comparable cash fare."
      );
      return;
    }

    setIsFindingCashPrice(true);
    setCashPriceMessage("");

    setCashFlightOptions([]);

    try {

      console.log("DUFFEL REQUEST", {
  origin: finalOrigin,
  destination: finalDestination,
  departureDate: finalDate,
  cabin,
  passengers: parsedPassengers,
  airline: matchAirline ?? airline,
  flightNumber: matchFlightNumber ?? flightNumber,
  isNonstop: matchIsNonstop ?? isNonstop,
});


      const response = await fetch("/api/duffel-cash-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  origin: finalOrigin,
  destination: finalDestination,
  departureDate: finalDate,
  cabin,
  passengers: parsedPassengers,
  airline: matchAirline ?? airline,
  flightNumber: matchFlightNumber ?? flightNumber,
  isNonstop: matchIsNonstop ?? isNonstop,

  
}),


      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cash fare lookup failed.");
      }

      if (data.needsSelection && Array.isArray(data.cashOptions)) {
  setCashFlightOptions(data.cashOptions);
  setCashPrice("");
  setCashPriceMessage(
    "Multiple matching cash flights found. Select the flight that matches your award."
  );
  return;
}

if (data.cashPrice) {
  setCashPrice(String(data.cashPrice));
  setCashFlightOptions([]);
  setCashPriceMessage(
    `Matched cash fare found: $${data.cashPrice} ${
      data.currency || ""
    } • ${data.airline || "unknown airline"} • ${data.stops || ""}`
  );
} else {
  setCashFlightOptions([]);
  setCashPriceMessage(
    data.message ||
      "No comparable cash fare found. You can still enter a cash price manually."
  );
}
    } catch (error) {
      setCashPriceMessage(
        error instanceof Error ? error.message : "Cash fare lookup failed."
      );
    } finally {
      setIsFindingCashPrice(false);
    }
  };

  

  const analyzeScreenshot = async () => {
    if (!screenshotFile) {
      setExtractionError("Upload a screenshot first.");
      return;
    }

    setIsExtracting(true);
    setExtractionError("");
    setCashPriceMessage("");

    try {
      const formData = new FormData();
      formData.append("screenshot", screenshotFile);

      const response = await fetch("/api/analyze-award-screenshot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Screenshot analysis failed.");
      }

      if (data.airline) setAirline(data.airline);
      if (data.program) setProgram(data.program);
      if (data.route) setRoute(data.route);
      if (data.origin) setOrigin(data.origin);
      if (data.destination) setDestination(data.destination);
      if (data.departureDate) setDepartureDate(data.departureDate);
if (data.flightNumber) setFlightNumber(data.flightNumber);
if (typeof data.isNonstop === "boolean") setIsNonstop(data.isNonstop);
if (data.cabin) setCabin(data.cabin);
      if (data.miles) setMiles(data.miles);
      if (data.taxes) setTaxes(data.taxes);
      if (data.cashPrice) setCashPrice(data.cashPrice);

      // IMPORTANT: do not set passengers from screenshot.
      // "9 seats left" is availability, not traveler count.

      if (data.origin && data.destination && data.departureDate) {
        await findCashPrice({
  originCode: data.origin,
  destinationCode: data.destination,
  travelDate: data.departureDate,
  matchAirline: data.airline || "",
  matchFlightNumber: data.flightNumber || "",
  matchIsNonstop:
    typeof data.isNonstop === "boolean" ? data.isNonstop : false,
});
      } else {
        setCashPriceMessage(
          "Award details extracted. Add or confirm the departure date to estimate cash fare."
        );
      }
    } catch (error) {
      setExtractionError(
        error instanceof Error ? error.message : "Screenshot analysis failed."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const inputClass =
    "w-full border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60";

  const readOnlyStyle = detailsLocked
    ? { backgroundColor: "#0B0B0B", color: "#94A3B8" }
    : { backgroundColor: "#111111", color: "white" };

  const decisionClass =
    bookingDecision.tone === "strong"
      ? "border-green-400/30 bg-green-500/10"
      : bookingDecision.tone === "bad"
      ? "border-red-400/30 bg-red-500/10"
      : "border-amber-400/30 bg-amber-500/10";

  return (
    <div className="border border-white/10 bg-[#090B12]/95 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-8">
      <div className="border-b border-white/10 pb-6">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Home
          </Link>
        </div>

        <p className="text-[11px] uppercase tracking-[0.38em] text-purple-300">
          Award Analyzer
        </p>

        <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white md:text-5xl">
          Analyze any award you find.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Upload an award screenshot or manually enter award details. Vantara
          checks transfer paths, wallet fit, cash comparison, and redemption
          value.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 border border-white/10 bg-white/10">
        {(["Automatic", "Manual"] as EntryMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setEntryMode(mode);
              setManualOverride(false);
              setExtractionError("");
              setCashPriceMessage("");
            }}
            className={`p-4 text-sm font-semibold transition ${
              entryMode === mode
                ? "bg-purple-500/20 text-white"
                : "bg-[#090B12] text-slate-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {mode} entry
          </button>
        ))}
      </div>

      <div className="mt-8 border border-purple-300/20 bg-purple-500/5 p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-300">
              Booking basics
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Cabin and passenger count are always controlled by you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={cabin}
              onChange={(e) => setCabin(e.target.value)}
              style={{ backgroundColor: "#111111", color: "white" }}
              className="border border-white/10 px-4 py-4 text-sm outline-none focus:border-purple-300"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>

            <div className="flex items-center justify-between border border-white/10 bg-[#111111]">
              <button
                type="button"
                onClick={() => updatePassengers(-1)}
                className="h-full px-5 text-xl font-semibold text-white hover:bg-white/5"
              >
                −
              </button>

              <div className="px-5 text-center">
                <p className="text-xs text-slate-500">Passengers</p>
                <p className="text-lg font-semibold text-white">
                  {passengers}
                </p>
              </div>

              <button
                type="button"
                onClick={() => updatePassengers(1)}
                className="h-full px-5 text-xl font-semibold text-white hover:bg-white/5"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {entryMode === "Automatic" && (
        <>
          <div className="mt-8 border border-purple-300/20 bg-purple-500/5 p-5">
            <p className="text-sm font-semibold text-purple-300">
              Screenshot intake
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Upload a screenshot of the award you found. Vantara will extract
              airline, route, date, miles, and taxes when visible.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:border-0 file:bg-purple-500/15 file:px-4 file:py-3 file:font-semibold file:text-purple-100 hover:file:bg-purple-500/25"
            />

            {screenshotPreview && (
              <div className="mt-4 border border-white/10 bg-black/30 p-3">
                <img
                  src={screenshotPreview}
                  alt="Uploaded award screenshot"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={analyzeScreenshot}
            disabled={!screenshotFile || isExtracting}
            className="mt-4 w-full border border-purple-300/40 bg-purple-500/10 p-4 font-semibold text-purple-100 transition hover:bg-purple-500/20 disabled:opacity-50"
          >
            {isExtracting ? "Extracting award details..." : "Extract details with AI"}
          </button>

          <label className="mt-4 flex items-center gap-3 border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={manualOverride}
              onChange={(e) => setManualOverride(e.target.checked)}
              className="h-4 w-4 accent-purple-500"
            />
            Override extracted details
          </label>
        </>
      )}

      {extractionError && (
        <p className="mt-3 text-sm text-red-300">{extractionError}</p>
      )}

      {cashPriceMessage && (
        <p className="mt-3 text-sm text-slate-300">{cashPriceMessage}</p>
      )}

      {cashFlightOptions.length > 0 && (
  <div className="mt-4 border border-amber-300/20 bg-amber-500/10 p-4">
    <p className="text-sm font-semibold text-amber-200">
      Choose the matching cash flight
    </p>

    <p className="mt-1 text-sm text-slate-300">
      Vantara found multiple similar flights. Select the one that matches your
      award screenshot.
    </p>

    <div className="mt-4 space-y-3">
      {cashFlightOptions.map((option) => (
        <button
          key={option.offerId}
          type="button"
          onClick={() => selectCashFlightOption(option)}
          className="w-full border border-white/10 bg-black/20 p-4 text-left transition hover:border-purple-300/50 hover:bg-purple-500/10"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">
                {option.airline || "Unknown airline"}{" "}
                {option.flightNumber ? `• ${option.flightNumber}` : ""}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {option.origin} → {option.destination} • {option.stops}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {option.departureTime || "Departure time unknown"} →{" "}
                {option.arrivalTime || "Arrival time unknown"}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xl font-semibold text-white">
                ${option.cashPrice} {option.currency || ""}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Match score: {option.matchScore}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
)}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          placeholder="Airline, ex: Alaska Airlines"
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          placeholder="Program, ex: Mileage Plan"
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          placeholder="Route, ex: TPA → SEA"
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          placeholder="Miles required, ex: 37,500"
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          value={taxes}
          onChange={(e) => setTaxes(e.target.value)}
          placeholder="Taxes & fees optional, ex: 5.60"
          disabled={detailsLocked}
          style={readOnlyStyle}
          className={inputClass}
        />

        <input
          value={cashPrice}
          onChange={(e) => setCashPrice(e.target.value)}
          placeholder="Cash price, ex: 3200"
          style={{ backgroundColor: "#111111", color: "white" }}
          className={inputClass}
        />

        <button
          type="button"
          onClick={() => findCashPrice({})}
          disabled={!route || !departureDate || isFindingCashPrice}
          className="border border-green-300/30 bg-green-500/10 p-4 text-sm font-semibold text-green-200 disabled:opacity-50"
        >
          {isFindingCashPrice
            ? "Finding estimated cash fare..."
            : "Find estimated cash fare"}
        </button>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Analysis
        </p>

        {!airline || !parsedMiles ? (
          <div className="mt-4 border border-white/10 bg-white/[0.03] p-5 text-slate-400">
            Add an airline and mileage cost to analyze this award.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className={`border p-5 ${decisionClass}`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Vantara recommendation
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {bookingDecision.label}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {bookingDecision.explanation}
              </p>

              {bestOption && (
                <div className="mt-5 border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">
                    Recommended path: {bestOption.card} → {bestOption.program}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {bestOptionTotal.toLocaleString()} transferable points
                    needed.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {preservePointsAdvice}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-slate-500">Total miles</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalMilesNeeded.toLocaleString()}
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-slate-500">Wallet fit</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {walletFitLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Score: {walletFitScore ?? "--"}
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs text-slate-500">Redemption score</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {redemptionScore ?? "--"}
                  {redemptionScore !== null ? "/100" : ""}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {redemptionLabel || "Add cash price"}
                </p>
              </div>
            </div>

            {bestOption && (
              <div className="border border-purple-300/30 bg-purple-500/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-purple-300">
                      Best transfer path
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {bestOption.card} → {bestOption.program}
                    </h3>

                    <p className="mt-3 text-sm text-slate-300">
                      {bestOptionTotal.toLocaleString()} transferable points
                      needed for {parsedPassengers} passenger
                      {parsedPassengers === 1 ? "" : "s"}.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
  <div className="border border-white/10 p-3">
    <p className="text-xs text-slate-500">
      Your balance
    </p>

    <p className="mt-1 font-semibold text-white">
      {bestBalance !== null
        ? bestBalance.toLocaleString()
        : "Not entered"}
    </p>
  </div>

  <div className="border border-white/10 p-3">
    <p className="text-xs text-slate-500">
      Status
    </p>

    <p
      className={`mt-1 font-semibold ${
        bestCanBook
          ? "text-green-300"
          : "text-amber-300"
      }`}
    >
      {bestCanBook
        ? "Ready to book"
        : bestBalance === null
        ? "Balance unknown"
        : `Short ${bestShortage.toLocaleString()}`}
    </p>
  </div>
</div>

    {bestOption.bonusPercent > 0 && (
  <p className="mt-2 text-sm text-purple-300">
    {bestOption.bonusPercent}% transfer bonus applied
  </p>
)}

{bestCanBook && (
  <div className="mt-4 border border-green-300/20 bg-green-500/10 p-3">
    <p className="text-sm font-semibold text-green-300">
      You have enough points.
    </p>

    <p className="mt-1 text-sm text-slate-300">
      Transfer from {bestOption.card} to {bestOption.program} and book this
      award.
    </p>
  </div>
)}

{!bestCanBook && bestBalance !== null && (
  <div className="mt-4 border border-amber-300/20 bg-amber-500/10 p-3">
    <p className="text-sm font-semibold text-amber-300">
      More points needed.
    </p>

    <p className="mt-1 text-sm text-slate-300">
      You are short by {bestShortage.toLocaleString()} points.
    </p>
  </div>
)}
            

                  
                      <p className="mt-2 text-sm text-purple-300">
                        {bestOption.bonusPercent}% transfer bonus applied
                      </p>
                    
                  </div>

                  <div
                    className={`w-fit px-3 py-2 text-xs font-semibold ${
                      bestCanBook
                        ? "bg-green-500/20 text-green-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {bestCanBook
                      ? "Bookable"
                      : bestBalance === null
                      ? "Balance unknown"
                      : `Short ${bestShortage.toLocaleString()}`}
                  </div>
                </div>
              </div>
            )}

            {centsPerPoint !== null && (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-slate-400">
                  Estimated redemption value
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-2xl font-semibold text-white">
                    {centsPerPoint.toFixed(2)}¢ per point
                  </p>

                  <span
                    className={`px-3 py-1 text-xs font-semibold ${
                      cppLabel === "Excellent"
                        ? "bg-green-500/20 text-green-300"
                        : cppLabel === "Good"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {cppLabel}
                  </span>
                </div>
              </div>
            )}

            {redemptionReasons.length > 0 && (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-4 font-semibold text-white">
                  Why this score?
                </p>

                <div className="space-y-3">
                  {redemptionReasons.map((reason) => (
                    <div
                      key={reason}
                      className="border border-white/10 bg-black/20 p-3 text-sm text-slate-300"
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transferOptions.length > 1 && (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-4 font-semibold text-white">
                  Other transfer paths
                </p>

                <div className="space-y-3">
                  {transferOptions.slice(1).map((option: any) => {
                    const totalCardPoints =
                      option.requiredCardPoints * parsedPassengers;

                    const balanceRaw = pointBalances[option.card];
                    const balance =
                      balanceRaw && balanceRaw.trim() !== ""
                        ? Number(balanceRaw.replace(/,/g, ""))
                        : null;

                    const canBook =
                      balance !== null && balance >= totalCardPoints;

                    const shortage =
                      balance !== null
                        ? Math.max(0, totalCardPoints - balance)
                        : 0;

                    return (
                      <div
                        key={`${option.card}-${option.program}`}
                        className="border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {option.card} → {option.program}
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {totalCardPoints.toLocaleString()} card points
                              needed
                            </p>
                          </div>

                          <span
                            className={`w-fit px-3 py-1 text-xs font-semibold ${
                              balance === null
                                ? "bg-white/10 text-slate-300"
                                : canBook
                                ? "bg-green-500/20 text-green-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {balance === null
                              ? "Balance unknown"
                              : canBook
                              ? "Bookable"
                              : `Short ${shortage.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 font-semibold text-white">What to do next</p>

              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  1. Confirm the award is still available on the airline or
                  booking program website.
                </p>

                <p>
                  2. Verify the final taxes, fees, cabin, and number of seats
                  before transferring points.
                </p>

                <p>
                  3. Transfer only after you are ready to book, since many
                  transfers cannot be reversed.
                </p>
              </div>
            </div>

            <div className="border border-amber-300/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100/80">
              Always confirm the award seat is still available before
              transferring points. Most credit card point transfers cannot be
              reversed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}