import { NextResponse } from "next/server";

type DepositRequest = {
  amount?: string;
  currency?: string;
  method?: string;
  accountNumber?: string;
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as DepositRequest;
  const amount = Number(body.amount);

  if (!body.accountNumber || !body.email || !body.currency || !body.method || !amount || amount < 100) {
    return NextResponse.json(
      { ok: false, message: "A valid account, email, currency, method, and minimum amount of 100 are required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      mode: "manual_payment_details",
      message: "Deposit request created. An ApexFX representative will provide payment details directly.",
      depositReference: `DEP-${Date.now()}`,
    },
    { status: 201 },
  );
}
