import { NextResponse } from "next/server";
import { adminCookieName, createAdminCookieValue } from "@/lib/auth";

type LoginRequest = {
  adminId?: string;
  secret?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;

  if (!process.env.ADMIN_API_SECRET || !process.env.ADMIN_OWNER_ID) {
    return NextResponse.json(
      { ok: false, message: "Admin login is not configured. Set ADMIN_OWNER_ID and ADMIN_API_SECRET." },
      { status: 503 },
    );
  }

  if (body.adminId !== process.env.ADMIN_OWNER_ID || body.secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ ok: false, message: "Invalid owner credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, message: "Admin access granted." });

  response.cookies.set({
    name: adminCookieName,
    value: createAdminCookieValue(body.adminId, "SUPER_ADMIN"),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });

  return response;
}
