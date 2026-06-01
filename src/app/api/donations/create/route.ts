import { NextResponse } from "next/server";

type DonationRequest = {
  campaignId?: string;
  donorName?: string;
  email?: string;
  amount?: string;
  currency?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as DonationRequest;
  const amount = Number(body.amount);

  if (!body.campaignId || !body.donorName || !body.email || !amount || amount < 5) {
    return NextResponse.json(
      { ok: false, message: "Campaign, donor name, email, and a minimum donation of 5 are required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      mode: "manual_representative_payment",
      message: "Donation pledge recorded. A donation representative will provide payment details directly.",
      donationReference: `DON-${Date.now()}`,
    },
    { status: 201 },
  );
}
