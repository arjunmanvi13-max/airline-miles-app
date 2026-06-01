"use client";

import { useMemo, useState } from "react";
import { getTransferOptions } from "@/app/logic";

export default function CalculatorScreen({
  selectedCards,
  applyTransferBonuses,
  pointBalances,
}: {
  selectedCards: string[];
  applyTransferBonuses: boolean;
  pointBalances: Record<string, string>;
}) {
  const [airline, setAirline] = useState("");
  const [program, setProgram] = useState("");
  const [miles, setMiles] = useState("");
  const [taxes, setTaxes] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabin, setCabin] = useState("Economy");

  const parsedMiles = Number(miles.replace(/,/g, "")) || 0;
  const parsedTaxes = Number(taxes) || 0;
  const parsedCash = Number(cashPrice) || 0;
  const parsedPassengers = Number(passengers) || 1;

  const mockDeal = {
    airline,
    transferAirlineMatch: airline,
    program,
    miles: parsedMiles,
    taxes: parsedTaxes,
    estimatedCashPrice: parsedCash,
    from: "N/A",
    to: "N/A",
    date: "N/A",
    stops: "Unknown",
    cabin,
    score: 0,
    tag: "Calculator",
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
  }, [airline, parsedMiles, selectedCards, applyTransferBonuses]);

  const totalMilesNeeded = parsedMiles * parsedPassengers;

  const centsPerPoint =
    parsedCash > 0 && parsedMiles > 0
      ? ((parsedCash - parsedTaxes) / parsedMiles) * 100
      : null;

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

  const cppLabel =
    centsPerPoint === null
      ? null
      : centsPerPoint >= 1.8
      ? "Excellent"
      : centsPerPoint >= 1.3
      ? "Good"
      : "Weak";

  return (
    <div className="border border-white/10 bg-[#090B12]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-8">
      <div className="border-b border-white/10 pb-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-purple-300">
          Transfer calculator
        </p>

        <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white md:text-5xl">
          Analyze an award booking.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Paste an award price you found elsewhere and let Vantara calculate
          the best transfer strategy using your wallet.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          placeholder="Airline, ex: United, Virgin Atlantic, ANA"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />

        <input
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          placeholder="Program, ex: MileagePlus, Flying Club"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />

        <input
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          placeholder="Miles required"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />

        <input
          value={taxes}
          onChange={(e) => setTaxes(e.target.value)}
          placeholder="Taxes & fees"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />

        <input
          value={cashPrice}
          onChange={(e) => setCashPrice(e.target.value)}
          placeholder="Estimated cash price optional"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />

        <input
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          placeholder="Passengers"
          style={{ backgroundColor: "#111111", color: "white" }}
          className="border border-white/10 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-purple-300"
        />
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Results
        </p>

        {!airline || !parsedMiles ? (
          <div className="mt-4 border border-white/10 bg-white/[0.03] p-5 text-slate-400">
            Enter an airline and mileage cost to calculate transfer strategies.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {bestOption && (
              <div className="border border-purple-300/30 bg-purple-500/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-purple-300">
                      Best wallet option
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {bestOption.card} → {bestOption.program}
                    </h3>

                    <p className="mt-3 text-sm text-slate-300">
                      {bestOptionTotal.toLocaleString()} transferable points
                      needed
                    </p>

                    {bestOption.bonusPercent > 0 && (
                      <p className="mt-2 text-sm text-purple-300">
                        {bestOption.bonusPercent}% transfer bonus applied
                      </p>
                    )}
                  </div>

                  <div
                    className={`px-3 py-2 text-xs font-semibold ${
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

            <div className="border border-purple-300/30 bg-purple-500/10 p-5">
              <p className="text-sm text-purple-200">
                Total airline miles needed
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {totalMilesNeeded.toLocaleString()}
              </p>
            </div>

            {centsPerPoint !== null && (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-slate-400">
                  Estimated point value
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <p className="text-2xl font-semibold text-white">
                    {centsPerPoint.toFixed(2)}¢ per point
                  </p>

                  <span
                    className={`px-2 py-1 text-xs font-semibold ${
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

                {centsPerPoint < 1 && (
                  <div className="mt-4 border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    This redemption may not provide strong value compared to
                    paying cash.
                  </div>
                )}
              </div>
            )}

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 font-semibold text-white">
                Available transfer paths
              </p>

              {transferOptions.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No matching transfer partners found. Try entering a broader
                  airline name like United, Air Canada, Virgin Atlantic, ANA,
                  British Airways, Qatar, Emirates, or Air France.
                </p>
              ) : (
                <div className="space-y-3">
                  {transferOptions.map((option) => {
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {option.card} → {option.program}
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {totalCardPoints.toLocaleString()} card points
                              needed
                            </p>

                            {option.bonusPercent > 0 && (
                              <p className="mt-1 text-sm text-purple-300">
                                Prototype bonus applied: +{option.bonusPercent}%
                              </p>
                            )}
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
              )}
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