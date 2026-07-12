import { createAdminToken, setAdminCookie } from "../_adminAuth.js";

type AdminLoginRequest = {
  username?: string;
  password?: string;
};

type VercelRequest = {
  method?: string;
  body?: AdminLoginRequest | string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
};

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) {
    response.status(500).json({ error: "Admin credentials are not configured" });
    return;
  }

  const payload = typeof request.body === "string" ? (JSON.parse(request.body) as AdminLoginRequest) : (request.body ?? {});

  if (payload.username !== expectedUsername || payload.password !== expectedPassword) {
    response.status(401).json({ error: "Invalid credentials" });
    return;
  }

  setAdminCookie(response, createAdminToken(expectedUsername));
  response.status(200).json({ ok: true, username: expectedUsername });
}
