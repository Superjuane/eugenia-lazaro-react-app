import { getAdminSession } from "../_adminAuth.js";

type VercelRequest = {
  method?: string;
  headers?: {
    cookie?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = getAdminSession(request);
  response.status(200).json({ authenticated: Boolean(session), username: session?.username ?? null });
}
