import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPaymentDetails, savePaymentDetails } from "@/lib/payment-details";

type PaymentDetailsRequest = {
  method?: string;
  instructions?: string;
};

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    details: await getPaymentDetails(),
  });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as PaymentDetailsRequest;
  const method = body.method?.trim();
  const instructions = body.instructions?.trim();

  if (!method || !instructions || instructions.length < 5) {
    return NextResponse.json(
      { ok: false, message: "Select a payment method and enter valid payment details." },
      { status: 400 },
    );
  }

  const record = await savePaymentDetails(method, instructions, session.adminId);

  return NextResponse.json({
    ok: true,
    message: `${method} payment details saved.`,
    record,
  });
}
