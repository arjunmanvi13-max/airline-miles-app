import { NextResponse } from "next/server";

const SEATS_AERO_TRIPS_BASE_URL = "https://seats.aero/partnerapi/trips";

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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing availability id." },
        { status: 400 }
      );
    }

    const response = await fetch(`${SEATS_AERO_TRIPS_BASE_URL}/${id}`, {
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
          error: "Seats.aero trip details request failed.",
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
        error: "Unexpected Seats.aero trip details error.",
      },
      { status: 500 }
    );
  }
}