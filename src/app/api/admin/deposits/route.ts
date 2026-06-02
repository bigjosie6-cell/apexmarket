import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listManualDeposits } from "@/lib/manual-deposits";

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    deposits: await listManualDeposits(),
  });
}
