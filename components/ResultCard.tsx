"use client";

import { FlightDealWithSource } from "@/app/adapters";
import {
  getAwardDurationText,
  getAwardRouteTypeText,
  getAwardScheduleText,
  getAwardSourceLabel,
  formatAirportTime,
} from "@/components/AwardText";
import { getBrandStyle, getLogoInitials } from "@/components/BrandBadge";

export default function ResultCard({
  deal,
  index,
  expandedDeals,
  toggleExpandedDeal,
  buildReturnPreview,
  returnDate,
  tripType,
  getCentsPerMile,
  getDealLabel,
  getDealStyle,
  getRecommendation,
  getRankedTransferOptions,
  getDealTotals,
  paidTravelers,
  saveTrip,
}: {
  deal: FlightDealWithSource;
  index: number;
  expandedDeals: string[];
  toggleExpandedDeal: (dealId: string) => void;
  buildReturnPreview: any;
  returnDate: string;
  tripType: string;
  getCentsPerMile: any;
  getDealLabel: any;
  getDealStyle: any;
  getRecommendation: any;
  getRankedTransferOptions: any;
  getDealTotals: any;
  paidTravelers: number;
  saveTrip: (deal: FlightDealWithSource) => void;
}) {
  const dealId = `${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`;
  const isExpanded = expandedDeals.includes(dealId);

  const returnPreview =
    tripType === "Round trip" ? buildReturnPreview(deal, returnDate) : null;

  const isRealCached =
    "dataSource" in deal && deal.dataSource === "seats_aero_cached";

  const centsPerMile = isRealCached ? null : getCentsPerMile(deal);

  const label = centsPerMile !== null ? getDealLabel(centsPerMile) : null;
  const style =
    centsPerMile !== null
      ? getDealStyle(centsPerMile)
      : "bg-blue-500/20 text-blue-300";

  const recommendation = getRecommendation(deal);

  const {
    transfer,
    totalCardPoints,
    totalAirlineMiles,
    totalTaxes,
    totalCashPrice,
    balanceKnown,
    canBook,
    pointsShort,
  } = getDealTotals(deal);

  const transferOptions = getRankedTransferOptions(deal);
  const displayProgram = transfer?.program || deal.program;

  return (
    <div className="mb-5 border border-white/10 bg-[#090B12] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold ${getBrandStyle(
                  deal.airline
                )}`}
              >
                {getLogoInitials(deal.airline)}
              </div>

              <div>
                <p className="text-lg font-semibold leading-tight text-white sm:text-xl">
                  {deal.airline}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-bold ${getBrandStyle(
                      displayProgram
                    )}`}
                  >
                    {getLogoInitials(displayProgram)}
                  </span>

                  <p className="text-xs text-slate-400">{displayProgram}</p>
                </div>
              </div>
            </div>

            <span className="border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">
              {deal.tag}
            </span>

            {"dataSource" in deal && (
              <span
                className={`border px-3 py-1 text-xs font-semibold ${
                  deal.dataSource === "seats_aero_cached"
                    ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                    : "border-amber-300/30 bg-amber-500/10 text-amber-100"
                }`}
              >
                {getAwardSourceLabel(deal)}
              </span>
            )}

            {deal.seatsRemaining && deal.dataSource === "seats_aero_cached" && (
              <span className="border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                {deal.seatsRemaining} seat
                {deal.seatsRemaining > 1 ? "s" : ""} left
              </span>
            )}

            {transfer && balanceKnown && (
              <span
                className={`border px-3 py-1 text-xs font-semibold ${
                  canBook
                    ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                    : "border-red-300/30 bg-red-500/10 text-red-100"
                }`}
              >
                {canBook ? "Bookable" : "Not enough points"}
              </span>
            )}

            {transfer && !balanceKnown && (
              <span className="border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">
                Balance not entered
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Outbound
              </p>

              <p className="text-sm text-slate-300">
                {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {getAwardScheduleText(deal)} • {getAwardDurationText(deal)} •{" "}
                {getAwardRouteTypeText(deal)}
              </p>
            </div>

            {returnPreview && (
              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Return
                </p>

                <p className="text-sm text-slate-300">
                  {returnPreview.from} → {returnPreview.to} •{" "}
                  {returnPreview.date} • {deal.cabin}
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {returnPreview.departureTime} → {returnPreview.arrivalTime} •{" "}
                  {returnPreview.duration} •{" "}
                  {deal.dataSource === "seats_aero_cached"
                    ? "Return details not confirmed in cached data"
                    : returnPreview.stops === "Nonstop"
                    ? "Simulated nonstop"
                    : returnPreview.stopCity
                    ? `Simulated 1 stop via ${returnPreview.stopCity}`
                    : "Simulated connection"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => toggleExpandedDeal(dealId)}
            className="mt-5 w-full border border-white/10 bg-white/[0.03] p-4 font-semibold text-white transition hover:bg-white/[0.07]"
          >
            {isExpanded ? "Hide flight details" : "View flight details"}
          </button>

          {isExpanded && (
            <div className="mt-4 border border-white/10 bg-white/[0.03] p-4">
              {!deal.segments || deal.segments.length === 0 ? (
                <div>
                  <p className="mb-2 font-semibold text-white">
                    Schedule details
                  </p>

                  <p className="text-sm leading-6 text-slate-300">
                    This result comes from real cached award availability data.
                    Availability, mileage cost, taxes, and seat counts may
                    change before booking confirmation.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-white">
                    Route: {deal.from} → {deal.to}
                  </p>

                  <p className="text-sm text-slate-300">
                    Route certainty: {getAwardRouteTypeText(deal)}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-3 font-semibold text-white">
                    Outbound flight details
                  </p>

                  <div className="space-y-4">
                    {deal.segments.map((segment, segmentIndex) => (
                      <div
                        key={`${segment.from}-${segment.to}-${segmentIndex}`}
                        className="border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {segment.from} → {segment.to}
                            </p>

                            <p className="text-sm text-slate-300">
                              {formatAirportTime(
                                segment.departureTime,
                                segment.from
                              )}{" "}
                              →{" "}
                              {formatAirportTime(
                                segment.arrivalTime,
                                segment.to
                              )}{" "}
                              • {segment.duration}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {segment.airline}
                              {segment.flightNumber
                                ? ` • Flight ${segment.flightNumber}`
                                : ""}
                              {" • "}
                              {deal.cabin}
                              {segment.aircraft ? ` • ${segment.aircraft}` : ""}
                            </p>
                          </div>

                          <span className="h-fit border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                            Segment {segmentIndex + 1}
                          </span>
                        </div>

                        {deal.segments.length > 1 &&
                          segmentIndex < deal.segments.length - 1 && (
                            <div className="mt-3 border-l-2 border-white/10 pl-3 text-xs text-slate-400">
                              Layover in {segment.to}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Total shown for {paidTravelers} paid traveler
            {paidTravelers === 1 ? "" : "s"}
            {tripType === "Round trip" ? " × round trip" : ""}
          </p>
        </div>

        {label && (
          <span className={`${style} h-fit px-3 py-1 text-sm font-semibold`}>
            {label}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="border border-purple-300/25 bg-purple-500/10 p-4">
          <p className="text-xs text-purple-200/80">Total Card Points Cost</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {totalCardPoints.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-purple-200/70">
            {transfer ? `${transfer.card} points` : "estimated miles"}
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Total Airline Miles</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {totalAirlineMiles.toLocaleString()}
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Total Taxes & Fees</p>
          <p className="mt-2 text-xl font-semibold text-white">
            ${totalTaxes.toFixed(2)}
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Cash Price</p>
          <p className="mt-2 text-xl font-semibold text-slate-300">
            {isRealCached ? "N/A" : `$${totalCashPrice}`}
          </p>

          {isRealCached && (
            <p className="mt-1 text-xs text-slate-500">
              Cash fares not provided by Seats.aero
            </p>
          )}
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Point Value</p>
          <p className="mt-2 text-xl font-semibold text-slate-300">
            {centsPerMile !== null
              ? `${centsPerMile.toFixed(2)}¢ / point`
              : "N/A"}
          </p>

          {isRealCached && (
            <p className="mt-1 text-xs text-slate-500">
              Requires real cash fare
            </p>
          )}
        </div>
      </div>

      {transfer ? (
        <div className="mt-6 border border-purple-300/25 bg-purple-500/10 p-5">
          <p className="mb-2 font-semibold text-purple-100">
            Best Booking Strategy
          </p>

          <p className="text-sm text-purple-100">
            Transfer {transfer.card} points →{" "}
            <span className="inline-flex items-center gap-2 font-semibold">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${getBrandStyle(
                  transfer.program
                )}`}
              >
                {getLogoInitials(transfer.program)}
              </span>
              {transfer.program}
            </span>
          </p>

          <p className="mt-2 text-sm text-purple-100/80">
            Base ratio: 1,000 {transfer.card} points ={" "}
            {(1000 * transfer.ratio).toLocaleString()} partner points
          </p>

          {transfer.bonusPercent > 0 && (
            <p className="mt-1 text-sm text-purple-200">
              Prototype bonus applied: +{transfer.bonusPercent}%
            </p>
          )}

          <p className="mt-1 text-sm text-purple-100/80">
            Estimated total card points needed:{" "}
            <span className="font-semibold text-white">
              {totalCardPoints.toLocaleString()}
            </span>
          </p>

          {balanceKnown ? (
            <p
              className={`mt-3 text-sm font-semibold ${
                canBook ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {canBook
                ? `You have enough ${transfer.card} points to book this.`
                : `You need ${pointsShort.toLocaleString()} more ${transfer.card} points.`}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-300">
              Enter your {transfer.card} balance to check if this is bookable.
            </p>
          )}

          {transferOptions.length > 1 && (
            <div className="mt-4 border-t border-purple-300/20 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
                Other available booking paths
              </p>

              <div className="space-y-1">
                {transferOptions.slice(1).map((option: any) => (
                  <p
                    key={`${option.card}-${option.program}`}
                    className="text-xs text-purple-100/80"
                  >
                    {option.card} → {option.program}:{" "}
                    {option.totalPoints.toLocaleString()} points{" "}
                    {option.canBook
                      ? "— bookable"
                      : !option.balanceKnown
                      ? "— balance unknown"
                      : `— short ${option.pointsShort.toLocaleString()}`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-1 font-semibold text-white">
            Best Booking Strategy
          </p>

          <p className="text-sm text-slate-300">
            Transfer data for this result has not been added yet.
          </p>
        </div>
      )}

      {!isRealCached && (
        <div className="mt-6 border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="font-semibold text-white">
              Miles vs Cash Recommendation:
            </p>

            <span
              className={`${recommendation.style} px-3 py-1 text-xs font-semibold`}
            >
              {recommendation.label}
            </span>
          </div>

          <p className="text-sm text-slate-300">
            {recommendation.explanation}
          </p>
        </div>
      )}

      {deal.bookingLink && (
        <a
          href={deal.bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full border border-purple-300/40 bg-purple-500/10 p-4 text-center font-semibold text-purple-100 hover:bg-purple-500/20"
        >
          Continue to {displayProgram}
        </a>
      )}

      <button
        onClick={() => saveTrip(deal)}
        className="mt-4 w-full border border-white/10 bg-white/[0.03] p-4 font-semibold text-white transition hover:bg-white/[0.07]"
      >
        Save this option
      </button>
    </div>
  );
}