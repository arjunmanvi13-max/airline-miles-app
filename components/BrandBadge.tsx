export const getLogoInitials = (name: string) => {
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

export const getBrandStyle = (name: string) => {
  const lower = name.toLowerCase();

  if (lower.includes("emirates") || lower.includes("skywards")) {
    return "bg-red-100 text-red-800 border-red-200";
  }

  if (lower.includes("air canada") || lower.includes("aeroplan")) {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }

  if (lower.includes("delta")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (lower.includes("united")) {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }

  if (lower.includes("american")) {
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  }

  if (lower.includes("alaska")) {
    return "bg-cyan-100 text-cyan-800 border-cyan-200";
  }

  if (lower.includes("qantas")) {
    return "bg-red-100 text-red-800 border-red-200";
  }

  if (lower.includes("flying blue") || lower.includes("air france")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (lower.includes("virgin")) {
    return "bg-pink-100 text-pink-800 border-pink-200";
  }

  return "bg-slate-100 text-slate-800 border-slate-200";
};