import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.SEATS_AERO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing SEATS_AERO_API_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams({
  origin_airport: searchParams.get("origin_airport") || "",
  destination_airport: searchParams.get("destination_airport") || "",
  start_date: searchParams.get("start_date") || "",
  end_date: searchParams.get("end_date") || "",
  take: searchParams.get("take") || "100",
  order_by: searchParams.get("order_by") || "lowest_mileage",
  cabins: searchParams.get("cabins") || "economy",
  include_filtered: searchParams.get("include_filtered") || "true",
});

  const response = await fetch(
    `https://seats.aero/partnerapi/search?${params.toString()}`,
    {
      headers: {
        accept: "application/json",
        "Partner-Authorization": apiKey,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}