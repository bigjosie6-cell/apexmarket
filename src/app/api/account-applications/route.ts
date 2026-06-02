import { NextResponse } from "next/server";
import { escapeHtml, sendEmail } from "@/lib/email";

type AccountApplicationRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  accountType?: string;
  baseCurrency?: string;
  expectedDeposit?: string;
  fundingMethod?: string;
  accountNumber?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AccountApplicationRequest;
  const email = body.email?.trim();
  const firstName = body.firstName?.trim() || "Client";
  const lastName = body.lastName?.trim() || "";
  const accountNumber = body.accountNumber?.trim() || `HF-${Date.now().toString().slice(-6)}`;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "A valid email address is required." }, { status: 400 });
  }

  const safe = {
    firstName: escapeHtml(firstName),
    lastName: escapeHtml(lastName),
    email: escapeHtml(email),
    phone: escapeHtml(body.phone ?? ""),
    country: escapeHtml(body.country ?? "United States"),
    accountType: escapeHtml(body.accountType ?? "Standard"),
    baseCurrency: escapeHtml(body.baseCurrency ?? "USD"),
    expectedDeposit: escapeHtml(body.expectedDeposit ?? "1000"),
    fundingMethod: escapeHtml(body.fundingMethod ?? "Bank Transfer"),
    accountNumber: escapeHtml(accountNumber),
  };

  const html = `
    <div style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0A1F44;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4ef;border-radius:12px;overflow:hidden;">
        <div style="background:#0A1F44;padding:28px;color:#ffffff;">
          <div style="display:inline-block;background:#ffffff;color:#D4AF37;font-weight:800;border-radius:8px;padding:10px 12px;margin-bottom:18px;">HF</div>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">Application received</h1>
          <p style="margin:12px 0 0;color:#dbe7f5;line-height:1.6;">Your Hutridge Financial account application has been prepared successfully.</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Hello ${safe.firstName},</p>
          <p style="font-size:16px;line-height:1.7;margin:0 0 22px;">We received your application and created your client reference. Keep this number for support and funding follow-up.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin:0 0 22px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.14em;">Application reference</p>
            <p style="margin:0;font-size:24px;font-weight:800;">${safe.accountNumber}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Name</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${safe.firstName} ${safe.lastName}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Email</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${safe.email}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Country</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${safe.country}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Account</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${safe.accountType}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Expected deposit</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${safe.baseCurrency} ${safe.expectedDeposit}</td></tr>
            <tr><td style="padding:10px;color:#64748b;">Funding method</td><td style="padding:10px;font-weight:700;">${safe.fundingMethod}</td></tr>
          </table>
          <p style="font-size:14px;line-height:1.7;color:#64748b;margin:22px 0 0;">If you did not submit this application, ignore this email or contact support.</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    "Hutridge Financial application received",
    `Reference: ${accountNumber}`,
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    `Country: ${body.country ?? "United States"}`,
    `Account: ${body.accountType ?? "Standard"}`,
    `Expected deposit: ${body.baseCurrency ?? "USD"} ${body.expectedDeposit ?? "1000"}`,
    `Funding method: ${body.fundingMethod ?? "Bank Transfer"}`,
  ].join("\n");

  const emailResult = await sendEmail({
    to: email,
    subject: `Hutridge Financial application received - ${accountNumber}`,
    html,
    text,
  });

  return NextResponse.json({
    ok: true,
    message: emailResult.sent
      ? "Application created and confirmation email sent."
      : `Application created. ${emailResult.message}`,
    accountNumber,
    emailSent: emailResult.sent,
    emailId: emailResult.id,
  });
}
