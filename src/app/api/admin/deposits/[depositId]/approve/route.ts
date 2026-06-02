import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { approveManualDeposit } from "@/lib/manual-deposits";

type RouteContext = {
  params: Promise<{
    depositId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { depositId } = await context.params;
    const deposit = await approveManualDeposit(depositId, session.adminId);

    return NextResponse.json({
      ok: true,
      message: `Deposit ${deposit.depositReference} approved.`,
      deposit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deposit approval failed";
    const status = message.includes("not found") ? 404 : 400;

    return NextResponse.json({ ok: false, message }, { status });
  }
}
