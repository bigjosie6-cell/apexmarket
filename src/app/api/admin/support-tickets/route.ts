import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listSupportTickets } from "@/lib/support-tickets";

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    tickets: await listSupportTickets(),
  });
}
