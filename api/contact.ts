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

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    response.status(200).json({
      ok: true,
      delivered: false,
      message: "Contact endpoint received the message, but CONTACT_WEBHOOK_URL is not configured yet.",
    });
    return;
  }

  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: process.env.CONTACT_TO_EMAIL ?? "juaneolivan@gmail.com",
      subject: `Nuevo mensaje de ${payload.name}`,
      replyTo: payload.email,
      message: payload.message,
    }),
  });

  if (!webhookResponse.ok) {
    response.status(502).json({ error: "Webhook delivery failed" });
    return;
  }

  response.status(200).json({ ok: true, delivered: true });
}
