type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

type SendEmailResult = {
  sent: boolean;
  message: string;
  id?: string;
};

const resendEndpoint = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = (process.env.EMAIL_FROM ?? "Hutridge Financial <onboarding@resend.dev>").replace(
    "ApexFX Markets",
    "Hutridge Financial",
  );

  if (!apiKey) {
    return {
      sent: false,
      message: "Email provider is not configured. Add RESEND_API_KEY and EMAIL_FROM in Vercel.",
    };
  }

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      sent: false,
      message: result.message ?? "Email could not be sent.",
    };
  }

  return {
    sent: true,
    message: "Email sent.",
    id: result.id,
  };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
