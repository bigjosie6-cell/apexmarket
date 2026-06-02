import { NextResponse } from "next/server";
import { listApplications } from "@/lib/applications";

type ClientLoginRequest = {
  email?: string;
  accountNumber?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ClientLoginRequest;
  const email = body.email?.trim().toLowerCase();
  const accountNumber = body.accountNumber?.trim().toUpperCase();

  if (!email || !accountNumber) {
    return NextResponse.json(
      { ok: false, message: "Email and account reference are required." },
      { status: 400 },
    );
  }

  const applications = await listApplications();
  const application = applications.find((item) => (
    item.email.toLowerCase() === email && item.accountNumber.toUpperCase() === accountNumber
  ));

  if (!application) {
    return NextResponse.json(
      { ok: false, message: "No account was found for those login details." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Login successful.",
    application,
  });
}
