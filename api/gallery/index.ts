import { getAdminSession } from "../_adminAuth";
import { createGalleryItem, getGalleryPayload } from "../_supabaseGallery";
import type { GalleryCreateInput } from "../../src/shared/types/gallery";

type VercelRequest = {
  method?: string;
  body?: GalleryCreateInput | string;
  query?: {
    scope?: string;
  };
  headers?: {
    cookie?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function parseBody(body: GalleryCreateInput | string | undefined) {
  return typeof body === "string" ? (JSON.parse(body) as GalleryCreateInput) : body;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method === "GET") {
      const includeDrafts = request.query?.scope === "admin" && Boolean(getAdminSession(request));
      response.status(200).json(await getGalleryPayload(includeDrafts));
      return;
    }

    if (request.method === "POST") {
      if (!getAdminSession(request)) {
        response.status(401).json({ error: "Unauthorized" });
        return;
      }

      const payload = parseBody(request.body);

      if (!payload) {
        response.status(400).json({ error: "Missing request body" });
        return;
      }

      response.status(201).json(await createGalleryItem(payload));
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Gallery request failed" });
  }
}
