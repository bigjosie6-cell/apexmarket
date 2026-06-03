import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listLoginActivity } from "@/lib/login-activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    logins: await listLoginActivity(),
  });
}
