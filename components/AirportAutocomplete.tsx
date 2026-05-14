"use client";

import { useEffect, useRef, useState } from "react";
import { airports } from "@/app/data";

export default function AirportAutocomplete({
  label,
  selectedAirport,
  onSelect,
}: {
  label: string;
  selectedAirport: string;
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selected = airports.find((airport) => airport.code === selectedAirport);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredAirports = airports
    .filter((airport) => {
      const search = query.trim().toLowerCase();

      const searchableText = [
        airport.code,
        airport.name,
        airport.region,
        "municipality" in airport ? airport.municipality : "",
        "country" in airport ? airport.country : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    })
    .slice(0, 8);

  const displayValue = isOpen
    ? query
    : selected
    ? `${selected.code} — ${selected.name}`
    : "";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <input
        value={displayValue}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder={`Search ${label.toLowerCase()} airport`}
        className="border border-slate-300 p-3 rounded-xl w-full bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400"
      />

      {isOpen && (
        <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {filteredAirports.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No matching airports found.
            </div>
          ) : (
            filteredAirports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onMouseDown={() => {
                  onSelect(airport.code);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
              >
                <p className="font-semibold text-slate-900">
                  {airport.code} — {airport.name}
                </p>

                <p className="text-xs text-slate-500">
                  {"municipality" in airport && airport.municipality
                    ? `${airport.municipality}, ${airport.country}`
                    : airport.region}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}