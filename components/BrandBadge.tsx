type BrandTone = {
  bg: string;
  text: string;
  border: string;
  ring: string;
  initials: string;
};

const brandStyles: Record<string, BrandTone> = {
  emirates: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    ring: "ring-red-100",
    initials: "EK",
  },
  aeroplan: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    ring: "ring-rose-100",
    initials: "AC",
  },
  delta: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-100",
    initials: "DL",
  },
  united: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    ring: "ring-sky-100",
    initials: "UA",
  },
  american: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    ring: "ring-indigo-100",
    initials: "AA",
  },
  alaska: {
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-200",
    ring: "ring-cyan-100",
    initials: "AS",
  },
  qantas: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    ring: "ring-red-100",
    initials: "QF",
  },
  flyingBlue: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-100",
    initials: "FB",
  },
  virgin: {
    bg: "bg-pink-50",
    text: "text-pink-800",
    border: "border-pink-200",
    ring: "ring-pink-100",
    initials: "VS",
  },
  default: {
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
    ring: "ring-slate-100",
    initials: "",
  },
};

export const getLogoInitials = (name: string) => {
  const brand = getBrandTone(name);

  if (brand.initials) return brand.initials;

  return name
    .replace("®", "")
    .replace("/", " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const getBrandTone = (name: string): BrandTone => {
  const lower = name.toLowerCase();

  if (lower.includes("emirates") || lower.includes("skywards")) {
    return brandStyles.emirates;
  }

  if (lower.includes("air canada") || lower.includes("aeroplan")) {
    return brandStyles.aeroplan;
  }

  if (lower.includes("delta")) {
    return brandStyles.delta;
  }

  if (lower.includes("united")) {
    return brandStyles.united;
  }

  if (lower.includes("american")) {
    return brandStyles.american;
  }

  if (lower.includes("alaska")) {
    return brandStyles.alaska;
  }

  if (lower.includes("qantas")) {
    return brandStyles.qantas;
  }

  if (lower.includes("flying blue") || lower.includes("air france")) {
    return brandStyles.flyingBlue;
  }

  if (lower.includes("virgin")) {
    return brandStyles.virgin;
  }

  return brandStyles.default;
};

export const getBrandStyle = (name: string) => {
  const brand = getBrandTone(name);
  return `${brand.bg} ${brand.text} ${brand.border}`;
};

export function BrandBadge({ name }: { name: string }) {
  const brand = getBrandTone(name);
  const initials = getLogoInitials(name);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ${brand.bg} ${brand.text} ${brand.border} ${brand.ring}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[10px] font-black shadow-sm">
        {initials}
      </span>

      <span>{name}</span>
    </div>
  );
}