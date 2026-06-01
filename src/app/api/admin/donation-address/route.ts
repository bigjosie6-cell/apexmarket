import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDonationAddress, saveDonationAddress } from "@/lib/donation-address";

type DonationAddressRequest = {
  receivingAddress?: string;
};

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    address: await getDonationAddress(),
  });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as DonationAddressRequest;
  const receivingAddress = body.receivingAddress?.trim();

  if (!receivingAddress || receivingAddress.length < 5) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid donation receiving address." },
      { status: 400 },
    );
  }

  const address = await saveDonationAddress(receivingAddress, session.adminId);

  return NextResponse.json({
    ok: true,
    message: "Donation receiving address saved.",
    address,
  });
}
