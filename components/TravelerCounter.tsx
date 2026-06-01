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
    <div className="flex items-center justify-between border border-white/10 bg-[#111111] p-4">
      <div>
        <p className="font-semibold text-white">{label}</p>
        {sublabel && <p className="mt-1 text-xs text-neutral-500">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={!canDecrease}
          className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.04] text-2xl font-semibold text-white transition hover:bg-white/[0.08]"
        >
          −
        </button>

        <span className="w-7 text-center font-semibold text-white">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.04] text-2xl font-semibold text-white transition hover:bg-white/[0.08]"
        >
          +
        </button>
      </div>
    </div>
  );
}