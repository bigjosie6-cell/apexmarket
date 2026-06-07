import { type NextRequest, NextResponse } from "next/server";
import { listApplications } from "@/lib/applications";
import { listOrders, saveOrder } from "@/lib/orders";

type OrderRequest = {
  symbol?: string;
  side?: "Buy" | "Sell";
  volume?: string;
  orderType?: "Market" | "Limit" | "Stop";
  accountNumber?: string;
  indicativePrice?: string;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const accountNumber = new URL(request.url).searchParams.get("accountNumber");
  return NextResponse.json({
    ok: true,
    orders: await listOrders(accountNumber),
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OrderRequest;
  const sessionAccount = request.cookies.get("hutridge-client-account")?.value?.trim().toUpperCase();
  const accountNumber = body.accountNumber?.trim().toUpperCase() || sessionAccount || "";
  const missing = ["symbol", "side", "volume"].filter((field) => !body[field as keyof OrderRequest]);
  if (!accountNumber) missing.push("accountNumber");

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, message: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const volume = Number(body.volume);
  if (!Number.isFinite(volume) || volume <= 0) {
    return NextResponse.json({ ok: false, message: "Enter a valid order volume." }, { status: 400 });
  }

  const applications = await listApplications();
  const application = applications.find((item) => item.accountNumber.toUpperCase() === accountNumber);

  if (!application && sessionAccount !== accountNumber) {
    return NextResponse.json({ ok: false, message: "Login with a registered account before submitting trade requests." }, { status: 403 });
  }

  const order = await saveOrder({
    accountNumber,
    email: application?.email ?? "client-session@hutridge.group",
    symbol: body.symbol ?? "",
    side: body.side ?? "Buy",
    volume,
    orderType: body.orderType ?? "Market",
    indicativePrice: body.indicativePrice ?? "",
  });

  return NextResponse.json({
    ok: true,
    mode: "trade_request_submitted",
    message: "Trade request submitted to the Hutridge desk.",
    order,
  }, { status: 202 });
}
