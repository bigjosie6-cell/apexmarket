import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listApplications } from "@/lib/applications";

export async function GET(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    ok: true,
    applications: await listApplications(),
  });
}
