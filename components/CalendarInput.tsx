"use client";

import { useEffect, useRef, useState } from "react";

export default function CalendarInput({
  label,
  value,
  comparisonDate,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  comparisonDate?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const monthName = visibleMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const startOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );

  const endOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  );

  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const formatDate = (day: number) => {
    const month = String(visibleMonth.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");

    return `${visibleMonth.getFullYear()}-${month}-${date}`;
  };

  const displayValue = value
  ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  : "";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>

      <button
  type="button"
  disabled={disabled}
  onClick={() => {
    if (disabled) return;
    setIsOpen((current) => !current);
  }}
  className="w-full border border-white/10 bg-[#111111] px-4 py-4 text-left text-sm text-white transition-all hover:border-white/20 focus:border-purple-300 disabled:cursor-not-allowed disabled:bg-[#0B0B0B] disabled:text-slate-400 disabled:opacity-60"
>
  {displayValue || "mm/dd/yyyy"}
</button>

      {isOpen && (
        <div className="absolute z-40 mt-2 w-full border border-white/10 bg-[#161616] p-4 shadow-2xl md:w-80">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth() - 1,
                    1
                  )
                )
              }
              className="flex h-9 w-9 items-center justify-center bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              ‹
            </button>

            <p className="font-semibold text-white">{monthName}</p>

            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth() + 1,
                    1
                  )
                )
              }
              className="flex h-9 w-9 items-center justify-center bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dateValue = day ? formatDate(day) : "";
              const isSelected = value === dateValue;
              const isComparisonDate = comparisonDate === dateValue;

              return day === null ? (
                <div key={`empty-${index}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(dateValue);
                    setIsOpen(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center text-sm text-neutral-300 transition-colors hover:bg-white/5"
                >
                  <span
                   className={`flex h-8 w-8 items-center justify-center rounded-full ${
  isSelected
    ? "border border-purple-300 bg-purple-500/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.55)]"
    : isComparisonDate
    ? "border border-purple-400/70 text-purple-200"
    : ""
}`}
                  >
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}