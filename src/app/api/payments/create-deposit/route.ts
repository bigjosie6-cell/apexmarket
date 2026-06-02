import { NextResponse } from "next/server";
import { saveManualDeposit } from "@/lib/manual-deposits";

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

  const depositReference = `DEP-${Date.now()}`;

  await saveManualDeposit({
    depositReference,
    accountNumber: body.accountNumber,
    email: body.email,
    amount,
    currency: body.currency,
    method: body.method,
    status: "Pending",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      ok: true,
      mode: "manual_payment_details",
      message: "Deposit request created. An Hutridge Financial representative will provide payment details directly.",
      depositReference,
    },
    { status: 201 },
  );
}
