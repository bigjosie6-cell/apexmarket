import { NextResponse } from "next/server";
import { saveSupportTicket } from "@/lib/support-tickets";

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

  const ticket = {
    ticketId: `SUP-${Date.now().toString().slice(-6)}`,
    fullName: body.fullName.trim(),
    email: body.email.trim(),
    category: body.category ?? "General",
    priority: body.priority ?? "Normal",
    message: body.message.trim(),
    status: "Open",
    createdAt: new Date().toISOString(),
  };

  await saveSupportTicket(ticket);

  return NextResponse.json({
    ok: true,
    ticketId: ticket.ticketId,
    message: "Support ticket created. A representative will follow up shortly.",
  });
}
