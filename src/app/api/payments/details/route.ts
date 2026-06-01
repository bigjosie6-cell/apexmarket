import { NextResponse } from "next/server";
import { getPaymentDetails } from "@/lib/payment-details";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get("method") ?? undefined;
  const details = await getPaymentDetails(method);

  return NextResponse.json({
    ok: true,
    details,
  });
}
