import { getAdminSession } from "../_adminAuth";
import { createGalleryGroup } from "../_supabaseGallery";

type VercelRequest = {
  method?: string;
  body?: { label?: string } | string;
  headers?: {
    cookie?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function parseBody(body: { label?: string } | string | undefined) {
  return typeof body === "string" ? (JSON.parse(body) as { label?: string }) : (body ?? {});
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!getAdminSession(request)) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = parseBody(request.body);
    response.status(201).json(await createGalleryGroup(payload.label ?? ""));
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Gallery group request failed" });
  }
}
