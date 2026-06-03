import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPortfolio, Holding, savePortfolio, summarizePortfolio } from "@/lib/portfolio";

type PortfolioRequest = {
  accountNumber?: string;
  holdings?: Holding[];
};

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const accountNumber = new URL(request.url).searchParams.get("accountNumber");
  const portfolio = await getPortfolio(accountNumber);
  return NextResponse.json({
    ok: true,
    accountNumber,
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
  const accountNumber = body.accountNumber?.trim();
  const holdings = body.holdings;

  if (!accountNumber) {
    return NextResponse.json({ ok: false, message: "Select a client signup before saving holdings." }, { status: 400 });
  }

  if (!Array.isArray(holdings) || holdings.length === 0) {
    return NextResponse.json({ ok: false, message: "Add at least one holding." }, { status: 400 });
  }

  const invalidHolding = holdings.find((holding) => !holding.name?.trim() || !holding.symbol?.trim() || !holding.category?.trim());
  if (invalidHolding) {
    return NextResponse.json({ ok: false, message: "Each holding needs a name, symbol, and category." }, { status: 400 });
  }

  const portfolio = await savePortfolio(holdings, session.adminId, accountNumber);

  return NextResponse.json({
    ok: true,
    accountNumber,
    message: `Portfolio holdings updated for ${accountNumber}.`,
    portfolio,
    summary: summarizePortfolio(portfolio.holdings),
  });
}
