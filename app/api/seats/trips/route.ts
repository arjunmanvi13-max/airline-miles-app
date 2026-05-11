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
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing availability id" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://seats.aero/partnerapi/trips/${id}`,
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