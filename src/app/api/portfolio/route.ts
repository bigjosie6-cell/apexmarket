import { NextResponse } from "next/server";
import { getPortfolio, summarizePortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const accountNumber = new URL(request.url).searchParams.get("accountNumber");
  const portfolio = await getPortfolio(accountNumber);

  return NextResponse.json({
    ok: true,
    portfolio,
    summary: summarizePortfolio(portfolio.holdings),
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
