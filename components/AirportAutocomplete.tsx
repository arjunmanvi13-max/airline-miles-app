"use client";

import { useEffect, useRef, useState } from "react";
import {
  commercialAirports,
  getAirportSearchPriority,
} from "@/app/airportUtils";

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

  const selected = commercialAirports.find(
    (airport) => airport.code === selectedAirport
  );

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

  const filteredAirports = commercialAirports
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
    .sort((a, b) => {
      const search = query.trim().toLowerCase();

      const aCodeMatch = a.code.toLowerCase() === search;
      const bCodeMatch = b.code.toLowerCase() === search;

      if (aCodeMatch && !bCodeMatch) return -1;
      if (!aCodeMatch && bCodeMatch) return 1;

      const aCityMatch =
        "municipality" in a && a.municipality.toLowerCase() === search;
      const bCityMatch =
        "municipality" in b && b.municipality.toLowerCase() === search;

      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;

      return getAirportSearchPriority(b) - getAirportSearchPriority(a);
    })
    .slice(0, 8);

  const displayValue = isOpen
    ? query
    : selected
    ? `${selected.code} — ${selected.name}`
    : "";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
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
  style={{
    backgroundColor: "#111111",
    color: "white",
  }}
  className="w-full border border-white/10 px-4 py-4 text-sm placeholder:text-neutral-500 outline-none transition-all hover:border-white/20 focus:border-purple-300"
/>

      {isOpen && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto border border-white/10 !bg-[#161616] shadow-2xl">
          {filteredAirports.length === 0 ? (
            <div className="px-4 py-4 text-sm text-neutral-400">
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
                className="w-full border-b border-white/5 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-white/5"
              >
                <p className="font-semibold text-white">
                  {airport.code} — {airport.name}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
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