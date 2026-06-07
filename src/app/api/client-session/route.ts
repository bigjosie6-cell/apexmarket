import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listApplications } from "@/lib/applications";

export async function GET() {
  const cookieStore = await cookies();
  const accountNumber = cookieStore.get("hutridge-client-account")?.value?.trim().toUpperCase();

  if (!accountNumber) {
    return NextResponse.json({ ok: false, message: "No logged-in client session was found." }, { status: 401 });
  }

  const applications = await listApplications();
  const application = applications.find((item) => item.accountNumber.toUpperCase() === accountNumber);

  if (!application) {
    return NextResponse.json({ ok: false, message: "Client session account could not be found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    application,
  });
}
