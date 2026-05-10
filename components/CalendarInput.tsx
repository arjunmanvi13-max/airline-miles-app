"use client";

import { useState } from "react";

export default function CalendarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

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
    ? new Date(value + "T00:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border border-slate-300 p-3 rounded-xl w-full text-left bg-white"
      >
        {displayValue || `Select ${label.toLowerCase()}`}
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-full md:w-80">
          <div className="flex items-center justify-between mb-4">
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
              className="px-3 py-1 rounded-lg bg-slate-100 font-semibold"
            >
              ‹
            </button>

            <p className="font-bold text-slate-900">{monthName}</p>

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
              className="px-3 py-1 rounded-lg bg-slate-100 font-semibold"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) =>
              day === null ? (
                <div key={`empty-${index}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(formatDate(day));
                    setIsOpen(false);
                  }}
                  className={`rounded-lg p-2 text-sm hover:bg-slate-100 ${
                    value === formatDate(day)
                      ? "bg-slate-900 text-white hover:bg-slate-900"
                      : "text-slate-800"
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}