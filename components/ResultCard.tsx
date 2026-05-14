"use client";

import { FlightDealWithSource } from "@/app/adapters";

import {
  getAwardDurationText,
  getAwardRouteTypeText,
  getAwardScheduleText,
  getAwardSourceLabel,
    formatAirportTime,
} from "@/components/AwardText";



import {
  getBrandStyle,
  getLogoInitials,
} from "@/components/BrandBadge";

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
  "dataSource" in deal &&
  deal.dataSource === "seats_aero_cached";

const centsPerMile = isRealCached
  ? null
  : getCentsPerMile(deal);

const label =
  centsPerMile !== null
    ? getDealLabel(centsPerMile)
    : null;

const style =
  centsPerMile !== null
    ? getDealStyle(centsPerMile)
    : "bg-blue-100 text-blue-800";
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
      <div
        key={`${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-5 mb-4"
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
  <div
    className={`w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold ${getBrandStyle(
      deal.airline
    )}`}
  >
    {getLogoInitials(deal.airline)}
  </div>

  <div>
    <p className="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
  {deal.airline}
</p>
    <div className="flex items-center gap-2 mt-1">
      <span
  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${getBrandStyle(
    displayProgram
  )}`}
>
  {getLogoInitials(displayProgram)}
</span>
<p className="text-xs text-slate-500">{displayProgram}</p>
    </div>
  </div>
</div>

              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                {deal.tag}
              </span>
              {"dataSource" in deal && (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      deal.dataSource === "seats_aero_cached"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {getAwardSourceLabel(deal)}
  </span>
)}

{deal.seatsRemaining && deal.dataSource === "seats_aero_cached" && (
  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
    {deal.seatsRemaining} seat
    {deal.seatsRemaining > 1 ? "s" : ""} left
  </span>
)}

              {transfer && balanceKnown && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    canBook
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {canBook ? "Bookable" : "Not enough points"}
                </span>
              )}

              {transfer && !balanceKnown && (
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Balance not entered
                </span>
              )}
            </div>

            <div className="mt-2 space-y-3">
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
    <p className="text-xs font-semibold text-slate-500 mb-1">
      Outbound
    </p>

    <p className="text-slate-600 text-sm">
      {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
    </p>

    <p className="text-sm font-semibold text-slate-900 mt-1">
  {getAwardScheduleText(deal)}
  {" • "}
  {getAwardDurationText(deal)}
  {" • "}
  {getAwardRouteTypeText(deal)}
</p>
  </div>

  {returnPreview && (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-semibold text-slate-500 mb-1">
        Return
      </p>

      <p className="text-slate-600 text-sm">
        {returnPreview.from} → {returnPreview.to} • {returnPreview.date} •{" "}
        {deal.cabin}
      </p>

      <p className="text-sm font-semibold text-slate-900 mt-1">
        {returnPreview.departureTime} → {returnPreview.arrivalTime}
        <span className="text-xs text-slate-500 ml-1">
          {returnPreview.stops === "Nonstop" ? "" : "(+1)"}
        </span>
        {" • "}
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
  className="mt-5 w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
>
  {isExpanded ? "Hide flight details" : "View flight details"}
</button>

{isExpanded && (
  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
    {!deal.segments || deal.segments.length === 0 ? (
  <div>
    <p className="font-semibold text-slate-900 mb-2">
      Schedule details
    </p>
    <p className="text-sm text-slate-600">
  This result comes from real cached award availability data. Availability,
mileage cost, taxes, and seat counts are based on Seats.aero data and may
change before booking confirmation.
</p>
    <p className="text-sm text-slate-800 mt-3 font-semibold">
      Route: {deal.from} → {deal.to}
    </p>
    <p className="text-sm text-slate-600">
      Route certainty: {getAwardRouteTypeText(deal)}
    </p>
  </div>
) : (
  <>
    <p className="font-semibold text-slate-900 mb-3">
      Outbound flight details
    </p>

    <div className="space-y-4">
      {deal.segments.map((segment, segmentIndex) => (
        <div key={`${segment.from}-${segment.to}-${segmentIndex}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
            <div>
              <p className="font-semibold text-slate-900">
                {segment.from} → {segment.to}
              </p>
              <p className="text-sm text-slate-600">
                {formatAirportTime(segment.departureTime, segment.from)} →{" "}
{formatAirportTime(segment.arrivalTime, segment.to)} •{" "}
{segment.duration}
              </p>
              <p className="text-xs text-slate-500 mt-1">
{segment.airline}

{segment.flightNumber
  ? ` • Flight ${segment.flightNumber}`
  : ""}

{" • "}

{deal.cabin}
  {segment.aircraft ? ` • ${segment.aircraft}` : ""}
</p>
            </div>

            <span className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 h-fit text-slate-600">
              Segment {segmentIndex + 1}
            </span>
          </div>

          {deal.segments.length > 1 &&
            segmentIndex < deal.segments.length - 1 && (
              <div className="mt-3 text-xs text-slate-500 border-l-2 border-slate-300 pl-3">
                <div className="mt-3 text-xs text-slate-500 border-l-2 border-slate-300 pl-3">
  Layover in {segment.to} •{" "}
  {(() => {
    const currentArrival = new Date(segment.arrivalTime);

    const nextSegment = deal.segments[segmentIndex + 1];

    if (!nextSegment) return "";

    const nextDeparture = new Date(nextSegment.departureTime);

    const diffMs =
      nextDeparture.getTime() - currentArrival.getTime();

    const totalMinutes = Math.floor(diffMs / 60000);

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  })()}
</div>
              </div>
            )}<p className="font-semibold text-slate-900 mb-3"></p>
        </div>
      ))}

      {returnPreview && (
  <div className="mt-5 border-t border-slate-300 pt-4">
    <p className="font-semibold text-slate-900 mb-3">
      Return flight details
    </p>

    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
      <div>
        <p className="font-semibold text-slate-900">
          {returnPreview.from} → {returnPreview.to}
        </p>

        <p className="text-sm text-slate-600">
          {returnPreview.departureTime} → {returnPreview.arrivalTime} •{" "}
          {returnPreview.duration}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          {deal.airline} • {deal.cabin} • estimated return segment
        </p>
      </div>

      <span className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 h-fit text-slate-600">
        Return
      </span>
    </div>

    {returnPreview.stops !== "Nonstop" && returnPreview.stopCity && (
      <div className="mt-3 text-xs text-slate-500 border-l-2 border-slate-300 pl-3">
        Layover in {returnPreview.stopCity} • approx. 2h
      </div>
    )}
  </div>
)}
    </div>
  </>
)}
  </div>
)}

            <p className="text-xs text-slate-500 mt-1">
              Total shown for {paidTravelers} paid traveler
              {paidTravelers === 1 ? "" : "s"}
              {tripType === "Round trip" ? " × round trip" : ""}
            </p>
          </div>

          {label && (
  <span
    className={`${style} h-fit px-3 py-1 rounded-full text-sm font-semibold`}
  >
    {label}
  </span>
)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mt-5">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-700">Total Card Points Cost</p>
            <p className="font-bold text-lg text-purple-900">
              {totalCardPoints.toLocaleString()}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {transfer ? `${transfer.card} points` : "estimated miles"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Airline Miles</p>
            <p className="font-bold text-lg">
              {totalAirlineMiles.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Taxes & Fees</p>
            <p className="font-bold text-lg">${totalTaxes.toFixed(2)}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
  <p className="text-xs text-slate-500">
    Cash Price
  </p>

  <p className="text-lg font-semibold text-slate-500 mt-1">
    {isRealCached ? "N/A" : `$${totalCashPrice}`}
  </p>

  {isRealCached && (
    <p className="text-xs text-slate-400 mt-1">
      Cash fares not provided by Seats.aero
    </p>
  )}
</div>

<div className="bg-slate-50 rounded-xl p-4">
  <p className="text-xs text-slate-500">Point Value</p>

  <p className="text-lg font-semibold text-slate-500 mt-1">
    {centsPerMile !== null
      ? `${centsPerMile.toFixed(2)}¢ / point`
      : "N/A"}
  </p>

  {isRealCached && (
    <p className="text-xs text-slate-400 mt-1">
      Requires real cash fare
    </p>
  )}
</div>

        
        </div>

        {transfer ? (
          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="font-semibold text-purple-900 mb-1">
              Best Booking Strategy
            </p>

            <p className="text-sm text-purple-900">
              Transfer {transfer.card} points →{" "}
<span className="inline-flex items-center gap-2 font-semibold">
  <span
    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${getBrandStyle(
      transfer.program
    )}`}
  >
    {getLogoInitials(transfer.program)}
  </span>
  {transfer.program}
</span>
            </p>

            <p className="text-sm text-purple-900 mt-1">
              Base ratio: 1,000 {transfer.card} points ={" "}
              {(1000 * transfer.ratio).toLocaleString()} partner points
            </p>

            {transfer.bonusPercent > 0 && (
              <p className="text-sm text-purple-900 mt-1">
                Prototype bonus applied: +{transfer.bonusPercent}%
              </p>
            )}
            <p className="text-sm text-purple-900 mt-1">
  Estimated total card points needed:{" "}
  <span className="font-semibold">
    {totalCardPoints.toLocaleString()}
  </span>
</p>

<p className="text-xs text-purple-700 mt-2">
  Recommendation reason:{" "}
  {transfer.canBook
    ? "this is the best option you can currently book with your saved balances."
    : !transfer.balanceKnown
    ? "this is the lowest-cost path among your selected cards, but your balance is not entered."
    : "this is the best available path, but you need more points to book it."}
</p>



            {balanceKnown ? (
              <p
                className={`text-sm mt-2 font-semibold ${
                  canBook ? "text-green-800" : "text-red-800"
                }`}
              >
                {canBook
                  ? `You have enough ${transfer.card} points to book this.`
                  : `You need ${pointsShort.toLocaleString()} more ${transfer.card} points.`}
              </p>
            ) : (
              <p className="text-sm text-slate-600 mt-2">
                Enter your {transfer.card} balance to check if this is bookable.
              </p>
            )}

            {transferOptions.length > 1 && (
              <div className="mt-3 border-t border-purple-200 pt-3">
                <p className="text-xs font-semibold text-purple-900 mb-1">
                  Other available booking paths
                </p>

                {transferOptions.slice(1).map((option: any) => (
  <p
    key={`${option.card}-${option.program}`}
    className="text-xs text-purple-800"
  >
    {option.card} → {option.program}:{" "}
    {option.totalPoints.toLocaleString()} points{" "}
    {option.canBook
      ? "✅ bookable"
      : !option.balanceKnown
      ? "— balance unknown"
      : `— short ${option.pointsShort.toLocaleString()}`}
  </p>
))}
              </div>
            )}
          </div>
        ) : (
          
          <div className="mt-5 bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-800 mb-1">
              Best Booking Strategy
            </p>
            <p className="text-sm text-slate-600">
              Transfer data for this result has not been added yet.
            </p>
          </div>
        )}

        {!isRealCached && (
  <div className="mt-5 bg-slate-50 rounded-xl p-4">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
      <p className="font-semibold text-slate-800">
        Miles vs Cash Recommendation:
      </p>

      <span
        className={`${recommendation.style} px-3 py-1 rounded-full text-xs font-semibold`}
      >
        {recommendation.label}
      </span>
    </div>

    <p className="text-sm text-slate-600">
      {recommendation.explanation}
    </p>
  </div>
)}

       
{deal.bookingLink && (
  <a
    href={deal.bookingLink}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 block w-full bg-purple-700 text-white text-center rounded-xl p-3 font-semibold hover:bg-purple-800"
  >
    Continue to {displayProgram}
  </a>
)}

        <button
          onClick={() => saveTrip(deal)}
          className="mt-4 w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
        >
          Save this option
        </button>
      </div>
    );
}