import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPortfolio, Holding, savePortfolio, summarizePortfolio } from "@/lib/portfolio";

type PortfolioRequest = {
  holdings?: Holding[];
};

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const portfolio = await getPortfolio();
  return NextResponse.json({
    ok: true,
    portfolio,
    summary: summarizePortfolio(portfolio.holdings),
  });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as PortfolioRequest;
  const holdings = body.holdings;

  if (!Array.isArray(holdings) || holdings.length === 0) {
    return NextResponse.json({ ok: false, message: "Add at least one holding." }, { status: 400 });
  }

  const invalidHolding = holdings.find((holding) => !holding.name?.trim() || !holding.symbol?.trim() || !holding.category?.trim());
  if (invalidHolding) {
    return NextResponse.json({ ok: false, message: "Each holding needs a name, symbol, and category." }, { status: 400 });
  }

  const portfolio = await savePortfolio(holdings, session.adminId);

  return NextResponse.json({
    ok: true,
    message: "Client portfolio holdings updated.",
    portfolio,
    summary: summarizePortfolio(portfolio.holdings),
  });
}
