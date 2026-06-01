import { NextResponse } from "next/server";
import { getDonationAddress } from "@/lib/donation-address";

export async function GET() {
  const address = await getDonationAddress();

  return NextResponse.json({
    ok: true,
    configured: Boolean(address?.receivingAddress),
    receivingAddress: address?.receivingAddress ?? "",
    updatedAt: address?.updatedAt ?? null,
  });
}
