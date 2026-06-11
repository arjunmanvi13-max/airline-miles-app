import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const airlineProgramMap: Record<string, string> = {
  "Alaska Airlines": "Mileage Plan",
  Alaska: "Mileage Plan",

  "American Airlines": "AAdvantage",
  American: "AAdvantage",

  "United Airlines": "MileagePlus",
  United: "MileagePlus",

  "Delta Air Lines": "SkyMiles",
  Delta: "SkyMiles",

  "Southwest Airlines": "Rapid Rewards",
  Southwest: "Rapid Rewards",

  JetBlue: "TrueBlue",

  "Air Canada": "Aeroplan",

  "Virgin Atlantic": "Flying Club",

  "British Airways": "Executive Club Avios®",

  "Air France": "Flying Blue®",
  KLM: "Flying Blue®",
  "Air France / KLM": "Flying Blue®",

  ANA: "ANA Mileage Club®",

  "Singapore Airlines": "KrisFlyer®",

  "Qatar Airways": "Privilege Club Avios®",
  Qatar: "Privilege Club Avios®",

  Emirates: "Skywards®",

  "Turkish Airlines": "Miles&Smiles®",
  Turkish: "Miles&Smiles®",

  "Cathay Pacific": "Asia Miles®",
  Cathay: "Asia Miles®",

  Avianca: "LifeMiles®",

  "Aer Lingus": "AerClub Avios®",
};

const normalizeProgram = ({
  airline,
  program,
}: {
  airline: string;
  program: string;
}) => {
  const trimmedAirline = airline.trim();
  const trimmedProgram = program.trim();

  if (!trimmedAirline) return trimmedProgram;

  const mappedProgram = airlineProgramMap[trimmedAirline];

  if (!trimmedProgram) {
    return mappedProgram || "";
  }

  if (
    trimmedProgram.toLowerCase() === trimmedAirline.toLowerCase() ||
    trimmedProgram.toLowerCase().includes("airlines")
  ) {
    return mappedProgram || trimmedProgram;
  }

  return trimmedProgram;
};

const normalizeAirportCode = (value: unknown) => {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
};

const normalizeDate = (value: unknown) => {
  const raw = String(value || "").trim();

  if (!raw) return "";

  const yyyyMmDdMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (yyyyMmDdMatch) return yyyyMmDdMatch[0];

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);

  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);

    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;

    const year = slashMatch[3]
      ? slashMatch[3].length === 2
        ? `20${slashMatch[3]}`
        : slashMatch[3]
      : "2026";

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return "";
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("screenshot");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No screenshot uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Extract award flight details from this screenshot. Return ONLY valid JSON with these keys: airline, program, origin, destination, departureDate, route, cabin, miles, taxes, cashPrice, flightNumber, departureTime, arrivalTime, isNonstop, passengers. airline should be the operating airline or award airline. program should be the loyalty program used for booking, not the airline name. origin and destination should be 3-letter IATA airport codes whenever visible. departureDate should be YYYY-MM-DD if visible or inferable from the screenshot; otherwise use an empty string. route should be formatted like ORIGIN → DESTINATION if possible. flightNumber should be the visible flight number like AS640, BA1511, UA934, VS26, etc. if present. departureTime and arrivalTime should be visible flight times if present. isNonstop should be true if the screenshot says Direct, Nonstop, nonstop, or clearly shows no stops. isNonstop should be false if it clearly shows one or more stops. Examples: Alaska Airlines -> Mileage Plan, United Airlines -> MileagePlus, American Airlines -> AAdvantage, Delta Air Lines -> SkyMiles, Virgin Atlantic -> Flying Club, Air Canada -> Aeroplan. Use empty strings for missing text fields. miles should be digits only if visible. taxes and cashPrice should be numbers as strings if visible. IMPORTANT: do not treat seat availability like '9 seats' as passengers. passengers should always be an empty string unless the screenshot clearly says traveler/passenger count. departureDate should be YYYY-MM-DD. If the screenshot shows a date like 7/14 and no year, assume 2026. For US-style flight screenshots, interpret 7/14 as July 14, not day/month.",
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const raw = response.output_text.trim();

    const cleaned = raw
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const airline = parsed.airline || "";
    const program = normalizeProgram({
      airline,
      program: parsed.program || "",
    });

    const origin = normalizeAirportCode(parsed.origin);
    const destination = normalizeAirportCode(parsed.destination);
    const departureDate = normalizeDate(parsed.departureDate);

    const route =
      parsed.route ||
      (origin && destination ? `${origin} → ${destination}` : "");

    return Response.json({
      airline,
      program,
      origin,
      destination,
      departureDate,
      route,
      cabin: parsed.cabin || "",
      miles: parsed.miles || "",
      taxes: parsed.taxes || "",
      cashPrice: parsed.cashPrice || "",
      flightNumber: parsed.flightNumber || "",
      departureTime: parsed.departureTime || "",
      arrivalTime: parsed.arrivalTime || "",
      isNonstop: Boolean(parsed.isNonstop),
      passengers: "",
    });
  } catch (error) {
    console.error("Award screenshot analysis failed:", error);

    const message =
      error instanceof Error ? error.message : "Screenshot analysis failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}