import { NextResponse } from "next/server";

const SEATS_AERO_BASE_URL = "https://seats.aero/partnerapi/search";

export async function GET(request: Request) {
  const apiKey = process.env.SEATS_AERO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Seats.aero API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const originAirport = searchParams.get("origin_airport") || "";
    const destinationAirport = searchParams.get("destination_airport") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    if (!originAirport || !destinationAirport || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required search parameters." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      origin_airport: originAirport,
      destination_airport: destinationAirport,
      start_date: startDate,
      end_date: endDate,
      take: searchParams.get("take") || "100",
      order_by: searchParams.get("order_by") || "lowest_mileage",
      cabins: searchParams.get("cabins") || "economy",
      include_filtered: searchParams.get("include_filtered") || "true",
    });

    const response = await fetch(`${SEATS_AERO_BASE_URL}?${params.toString()}`, {
      headers: {
        accept: "application/json",
        "Partner-Authorization": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Seats.aero search request failed.",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected Seats.aero search error.",
      },
      { status: 500 }
    );
  }
}