import { NextResponse } from "next/server";

type SupportTicketRequest = {
  fullName?: string;
  email?: string;
  category?: string;
  priority?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SupportTicketRequest;

  if (!body.fullName?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Full name, email address, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    ticketId: `SUP-${Date.now().toString().slice(-6)}`,
    message: "Support ticket created. A representative will follow up shortly.",
  });
}
