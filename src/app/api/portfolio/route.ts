import { NextResponse } from "next/server";
import { getPortfolio, summarizePortfolio } from "@/lib/portfolio";

export async function GET() {
  const portfolio = await getPortfolio();

  return NextResponse.json({
    ok: true,
    portfolio,
    summary: summarizePortfolio(portfolio.holdings),
  });
}
