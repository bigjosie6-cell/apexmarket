import { NextResponse } from "next/server";

type OrderRequest = {
  symbol?: string;
  side?: "Buy" | "Sell";
  volume?: string;
  orderType?: "Market" | "Limit" | "Stop";
  accountNumber?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderRequest;
  const missing = ["symbol", "side", "volume", "accountNumber"].filter((field) => !body[field as keyof OrderRequest]);

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, message: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  if (!process.env.BROKER_ORDER_API_URL || !process.env.BROKER_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        mode: "broker_not_connected",
        message:
          "Order captured for review, but live execution is disabled until a licensed broker API and execution agreement are configured.",
        orderId: `ORD-${Date.now()}`,
      },
      { status: 202 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      mode: "integration_required",
      message:
        "Broker credentials are present, but this project needs the broker-specific adapter implemented before sending live market orders.",
    },
    { status: 501 },
  );
}
