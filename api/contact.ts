type ContactRequest = {
  name?: string;
  email?: string;
  message?: string;
};

type VercelRequest = {
  method?: string;
  body?: ContactRequest | string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendWithResend(payload: Required<ContactRequest>) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return null;
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "juaneolivan@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Eugenia Pintura <onboarding@resend.dev>";
  const subject = `Nuevo mensaje de ${payload.name}`;
  const text = `Nombre: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`;
  const html = `
    <h2>Nuevo mensaje desde Eugenia Pintura</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
      reply_to: payload.email,
    }),
  });

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    throw new Error(`Resend delivery failed: ${errorBody}`);
  }

  return resendResponse.json() as Promise<{ id: string }>;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload =
    typeof request.body === "string" ? (JSON.parse(request.body) as ContactRequest) : (request.body ?? {});

  if (!payload.name || !payload.email || !payload.message) {
    response.status(400).json({ error: "Missing required fields" });
    return;
  }

  const normalizedPayload = {
    name: payload.name,
    email: payload.email,
    message: payload.message,
  };

  try {
    const resendResult = await sendWithResend(normalizedPayload);

    if (resendResult) {
      response.status(200).json({ ok: true, delivered: true, provider: "resend", id: resendResult.id });
      return;
    }
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "Resend delivery failed" });
    return;
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    response.status(200).json({
      ok: true,
      delivered: false,
      message: "Mensaje recibido por el endpoint, pero falta configurar RESEND_API_KEY o CONTACT_WEBHOOK_URL para entregar emails.",
    });
    return;
  }

  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: process.env.CONTACT_TO_EMAIL ?? "juaneolivan@gmail.com",
      subject: `Nuevo mensaje de ${normalizedPayload.name}`,
      replyTo: normalizedPayload.email,
      message: normalizedPayload.message,
    }),
  });

  if (!webhookResponse.ok) {
    response.status(502).json({ error: "Webhook delivery failed" });
    return;
  }

  response.status(200).json({ ok: true, delivered: true, provider: "webhook" });
}
