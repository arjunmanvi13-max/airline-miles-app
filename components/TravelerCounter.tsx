"use client";

export default function TravelerCounter({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3">
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold"
        >
          −
        </button>

        <span className="w-6 text-center font-semibold">{value}</span>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}