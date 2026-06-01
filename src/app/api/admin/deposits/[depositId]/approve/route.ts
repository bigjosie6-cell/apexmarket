import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { approveDeposit } from "@/lib/deposits";
import { getDb } from "@/lib/db";

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

  const db = getDb();

  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Database is not connected. Wire Prisma or your database client in src/lib/db.ts before approving real deposits.",
      },
      { status: 503 },
    );
  }

  try {
    const { depositId } = await context.params;
    const result = await approveDeposit(db, depositId, session.adminId);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deposit approval failed";
    const status = message.includes("not found") ? 404 : 400;

    return NextResponse.json({ ok: false, message }, { status });
  }
}
