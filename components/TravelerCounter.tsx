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
  const canDecrease = value > min;

  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white">
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={!canDecrease}
          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200"
        >
          −
        </button>

        <span className="w-7 text-center font-semibold text-slate-900">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 font-bold hover:bg-purple-200"
        >
          +
        </button>
      </div>
    </div>
  );
}