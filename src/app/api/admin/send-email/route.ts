import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email";

type AdminEmailRequest = {
  to?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  const session = requireAdmin(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as AdminEmailRequest;
  const to = body.to?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!to || !subject || !message) {
    return NextResponse.json(
      { ok: false, message: "Recipient email, subject, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, message: "Enter a valid recipient email address." }, { status: 400 });
  }

  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  const emailResult = await sendEmail({
    to,
    subject,
    html: `
      <div style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0A1F44;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4ef;border-radius:12px;overflow:hidden;">
          <div style="background:#0A1F44;padding:28px;color:#ffffff;">
            <div style="display:inline-block;background:#ffffff;color:#D4AF37;font-weight:800;border-radius:8px;padding:10px 12px;margin-bottom:18px;">HF</div>
            <h1 style="margin:0;font-size:26px;line-height:1.25;">${safeSubject}</h1>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Hello,</p>
            <div style="font-size:16px;line-height:1.75;margin:0 0 22px;">${safeMessage}</div>
            <p style="font-size:14px;line-height:1.7;color:#64748b;margin:22px 0 0;">This message was sent by Hutridge Financial support.</p>
          </div>
        </div>
      </div>
    `,
    text: message,
  });

  return NextResponse.json({
    ok: emailResult.sent,
    message: emailResult.sent ? `Email sent to ${to}.` : emailResult.message,
    emailId: emailResult.id,
  }, { status: emailResult.sent ? 200 : 502 });
}
