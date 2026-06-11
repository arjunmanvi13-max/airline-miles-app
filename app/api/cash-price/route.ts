export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = process.env.TRAVELPAYOUTS_TOKEN;

    if (!token) {
      return Response.json(
        { error: "Missing TRAVELPAYOUTS_TOKEN in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const origin = String(body.origin || "").toUpperCase();
    const destination = String(body.destination || "").toUpperCase();
    const departureDate = String(body.departureDate || "");
    const currency = "usd";

    if (!origin || !destination || !departureDate) {
      return Response.json(
        { error: "Origin, destination, and departure date are required." },
        { status: 400 }
      );
    }

    const url = new URL("https://api.travelpayouts.com/v2/prices/latest");

    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    const beginningOfMonth = departureDate.slice(0, 7) + "-01";

url.searchParams.set("beginning_of_period", beginningOfMonth);
url.searchParams.set("period_type", "month");
    url.searchParams.set("one_way", "true");
    url.searchParams.set("currency", currency);
    url.searchParams.set("limit", "30");

    const response = await fetch(url.toString(), {
      headers: {
        "X-Access-Token": token,
      },
      cache: "no-store",
    });

    const data = await response.json();

    console.log("TravelPayouts lookup", {
  status: response.status,
  requestUrl: url.toString().replace(token, "HIDDEN_TOKEN"),
  rawResponse: data,
});

    if (!response.ok || !data.success) {
      return Response.json(
        {
          error:
            data.error ||
            data.message ||
            "TravelPayouts cash fare lookup failed.",
        },
        { status: 500 }
      );
    }

    const prices = Array.isArray(data.data) ? data.data : [];

    if (prices.length === 0) {
  console.log("TravelPayouts empty response", {
    requestUrl: url.toString().replace(token, "HIDDEN_TOKEN"),
    rawResponse: data,
  });

  return Response.json({
    cashPrice: "",
    source: "travelpayouts_cached",
    confidence: "none",
    message: "No comparable cached cash fare found.",
    debug: {
      requestUrl: url.toString().replace(token, "HIDDEN_TOKEN"),
      rawResponse: data,
    },
  });
}

    const cheapest = prices
      .filter((item: any) => typeof item.value === "number")
      .sort((a: any, b: any) => a.value - b.value)[0];

    if (!cheapest) {
      return Response.json({
        cashPrice: "",
        source: "travelpayouts_cached",
        confidence: "none",
        message: "No valid cash fare found.",
      });
    }

    return Response.json({
      cashPrice: String(cheapest.value),
      currency,
      source: "travelpayouts_cached",
      confidence: "estimated",
      origin,
      destination,
      departureDate,
      airline: cheapest.airline || "",
      flightNumber: cheapest.flight_number || "",
      expiresAt: cheapest.expires_at || "",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cash fare lookup failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}