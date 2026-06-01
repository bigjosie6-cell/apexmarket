import { NextResponse } from "next/server";

const depositApprovalRoles = ["SUPER_ADMIN", "FINANCE_ADMIN", "COMPLIANCE_OFFICER"];
export const adminCookieName = "apexfx_admin_session";

export type AdminSession = {
  adminId: string;
  role: string;
};

export function requireAdmin(request: Request): AdminSession | NextResponse {
  const cookieSession = getAdminSessionFromCookie(request);
  const adminId = cookieSession?.adminId ?? request.headers.get("x-admin-id");
  const role = cookieSession?.role ?? request.headers.get("x-admin-role");
  const adminSecret = request.headers.get("x-admin-secret");

  if (!process.env.ADMIN_API_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        message: "Admin API is not configured. Set ADMIN_API_SECRET before enabling deposit approvals.",
      },
      { status: 503 },
    );
  }

  if (!adminId || (!cookieSession && adminSecret !== process.env.ADMIN_API_SECRET)) {
    return NextResponse.json({ ok: false, message: "Unauthorized admin request." }, { status: 401 });
  }

  if (process.env.ADMIN_OWNER_ID && adminId !== process.env.ADMIN_OWNER_ID) {
    return NextResponse.json(
      { ok: false, message: "Only the account owner can access admin actions." },
      { status: 403 },
    );
  }

  if (!role || !depositApprovalRoles.includes(role)) {
    return NextResponse.json(
      { ok: false, message: "You are not authorized to approve deposits." },
      { status: 403 },
    );
  }

  return { adminId, role };
}

export function createAdminCookieValue(adminId: string, role: string) {
  return Buffer.from(JSON.stringify({ adminId, role }), "utf8").toString("base64url");
}

export function getAdminSessionFromCookie(request: Request): AdminSession | null {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${adminCookieName}=`));

  if (!cookie) return null;

  try {
    const value = cookie.split("=")[1];
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AdminSession;
    return parsed.adminId && parsed.role ? parsed : null;
  } catch {
    return null;
  }
}
