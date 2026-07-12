import { getAdminSession } from "../../_adminAuth";
import { deleteGalleryGroup, updateGalleryGroup } from "../../_supabaseGallery";

type VercelRequest = {
  method?: string;
  body?: { label?: string } | string;
  query?: {
    id?: string | string[];
  };
  headers?: {
    cookie?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function getId(queryId: string | string[] | undefined) {
  return Array.isArray(queryId) ? queryId[0] : queryId;
}

function parseBody(body: { label?: string } | string | undefined) {
  return typeof body === "string" ? (JSON.parse(body) as { label?: string }) : (body ?? {});
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const id = getId(request.query?.id);

  if (!id) {
    response.status(400).json({ error: "Missing group id" });
    return;
  }

  if (!getAdminSession(request)) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    if (request.method === "PATCH") {
      const payload = parseBody(request.body);
      response.status(200).json(await updateGalleryGroup(id, payload.label ?? ""));
      return;
    }

    if (request.method === "DELETE") {
      await deleteGalleryGroup(id);
      response.status(200).json({ ok: true });
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Gallery group request failed" });
  }
}
