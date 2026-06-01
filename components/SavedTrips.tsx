"use client";

import { useState } from "react";
import { FlightDealWithSource } from "@/app/adapters";
import { formatAirportTime } from "@/components/AwardText";

export default function SavedTrips({
  savedTrips,
  onRemoveSavedTrip,
}: {
  savedTrips: FlightDealWithSource[];
  onRemoveSavedTrip: (index: number) => void;
}) {
  const [expandedTrips, setExpandedTrips] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedTrips((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  return (
    <div className="border border-white/10 bg-[#090B12]/95 p-5 md:p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300">
        Saved research
      </p>

      <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white">
        Saved trips
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
        Saved award options for comparison during beta testing.
      </p>

      {savedTrips.length === 0 ? (
        <div className="mt-6 border border-white/10 bg-white/[0.03] p-5 text-slate-400">
          No saved trips yet. Save an option from the Results screen to compare
          it later.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {savedTrips.map((deal, index) => {
            const isExpanded = expandedTrips.includes(index);

            return (
              <div
                key={`${deal.airline}-${deal.date}-${deal.from}-${deal.to}-${index}`}
                className="border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{deal.airline}</p>

                    <p className="mt-1 text-sm text-slate-400">
                      {deal.from} → {deal.to} • {deal.date} • {deal.cabin}
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {deal.miles.toLocaleString()} miles • ${deal.taxes.toFixed(2)} taxes
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">
                        {deal.program}
                      </span>

                      {deal.seatsRemaining && (
                        <span className="border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                          {deal.seatsRemaining} seat
                          {deal.seatsRemaining > 1 ? "s" : ""} left
                        </span>
                      )}

                      {deal.dataSource === "seats_aero_cached" && (
                        <span className="border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                          Real cached award
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Saved locally on this browser
                    </p>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-sm font-semibold text-purple-200 hover:text-purple-100"
                    >
                      {isExpanded ? "Hide details" : "View details"}
                    </button>

                    <button
                      onClick={() => onRemoveSavedTrip(index)}
                      className="text-sm font-semibold text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border border-white/10 bg-black/20 p-4">
                    <p className="mb-3 font-semibold text-white">
                      Saved itinerary details
                    </p>

                    {deal.segments && deal.segments.length > 0 ? (
                      <div className="space-y-3">
                        {deal.segments.map((segment, segmentIndex) => (
                          <div
                            key={`${segment.from}-${segment.to}-${segmentIndex}`}
                            className="border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                              <div>
                                <p className="font-semibold text-white">
                                  {segment.from} → {segment.to}
                                </p>

                                <p className="text-sm text-slate-400">
                                  {formatAirportTime(segment.departureTime, segment.from)} →{" "}
                                  {formatAirportTime(segment.arrivalTime, segment.to)} •{" "}
                                  {segment.duration || "Duration TBD"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {segment.airline}
                                  {segment.flightNumber
                                    ? ` • Flight ${segment.flightNumber}`
                                    : ""}
                                  {segment.aircraft ? ` • ${segment.aircraft}` : ""}
                                </p>
                              </div>

                              <span className="h-fit border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-400">
                                Segment {segmentIndex + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Full segment details were not available for this saved
                        option.
                      </p>
                    )}

                    {deal.bookingLink && (
                      <a
                        href={deal.bookingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block w-full border border-purple-300/40 bg-purple-500/10 p-3 text-center font-semibold text-purple-100 hover:bg-purple-500/20"
                      >
                        Continue to {deal.program}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}