import crypto from "node:crypto";
import type { GalleryCreateInput, GalleryDataPayload, GalleryGroup, GalleryItem } from "../src/shared/types/gallery";

const DEFAULT_SUPABASE_URL = "https://pzxgkiqvnyydqauzdvgv.supabase.co";
const DEFAULT_BUCKET = "Eugenia Lazaro Pintura - imagenes publicas";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type GalleryGroupRecord = {
  id: string;
  label: string;
  sort_order: number | null;
};

type GalleryItemRecord = {
  id: string;
  title: string;
  group_id: string;
  image_path: string;
  alt: string | null;
  etiquetas: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  published: boolean | null;
  work_date: string | null;
  sort_order: number | null;
};

type GalleryUpdateInput = Partial<
  Pick<GalleryItem, "title" | "category" | "etiquetas" | "colors" | "alt" | "featured" | "published" | "sortOrder"> & {
    createdAt: string;
  }
>;

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL)
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
}

function getSupabaseRestUrl() {
  return (process.env.SUPABASE_REST_URL ?? `${getSupabaseUrl()}/rest/v1`).replace(/\/$/, "");
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
}

function getSupabaseApiKey() {
  return getSupabaseServiceKey() || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
}

function getBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
}

function requireSupabaseConfig() {
  const apiKey = getSupabaseApiKey();

  if (!apiKey) {
    throw new Error("Supabase API key is not configured.");
  }

  return apiKey;
}

function requireSupabaseServiceKey() {
  const serviceKey = getSupabaseServiceKey();

  if (!serviceKey) {
    throw new Error("Supabase secret key is not configured.");
  }

  return serviceKey;
}

async function supabaseRestFetch<T>(path: string, options: RequestInit = {}, useServiceKey = true) {
  const apiKey = useServiceKey ? requireSupabaseServiceKey() : requireSupabaseConfig();
  const response = await fetch(`${getSupabaseRestUrl()}${path}`, {
    ...options,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

function encodeStorageTarget(bucket: string, objectPath?: string) {
  const encodedBucket = encodeURIComponent(bucket);

  if (!objectPath) {
    return encodedBucket;
  }

  return `${encodedBucket}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

function getPublicObjectUrl(objectPath: string) {
  return `${getSupabaseUrl()}/storage/v1/object/public/${encodeStorageTarget(getBucketName(), objectPath)}`;
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "imagen"
  );
}

function extensionForMimeType(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid image payload.");
  }

  const [, mimeType, base64] = match;

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Unsupported image type.");
  }

  const buffer = Buffer.from(base64, "base64");

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large after optimization.");
  }

  return { mimeType, buffer };
}

function mapItem(record: GalleryItemRecord, groups: GalleryGroup[]): GalleryItem {
  const group = groups.find((candidate) => candidate.id === record.group_id);
  const categoryLabel = group?.label ?? record.group_id;
  const imageUrl = getPublicObjectUrl(record.image_path);

  return {
    id: record.id,
    title: record.title,
    category: record.group_id,
    categoryLabel,
    etiquetas: record.etiquetas ?? [],
    colors: record.colors ?? [],
    alt: record.alt ?? `${record.title} - ${categoryLabel}`,
    thumbnailUrl: imageUrl,
    fullUrl: imageUrl,
    featured: Boolean(record.featured),
    published: Boolean(record.published),
    createdAt: record.work_date ?? new Date().toISOString().slice(0, 10),
    sortOrder: record.sort_order ?? 0,
  };
}

function mapGroup(record: GalleryGroupRecord): GalleryGroup {
  return {
    id: record.id,
    label: record.label,
  };
}

async function getGroups() {
  const groups = await supabaseRestFetch<GalleryGroupRecord[]>("/gallery_groups?select=*&order=sort_order.asc,label.asc");
  return groups.map(mapGroup);
}

async function getNextSortOrder(table: "gallery_items" | "gallery_groups") {
  const rows = await supabaseRestFetch<Array<{ sort_order: number | null }>>(
    `/${table}?select=sort_order&order=sort_order.desc&limit=1`,
  );

  return (rows[0]?.sort_order ?? 0) + 1;
}

async function uploadImage(input: GalleryCreateInput) {
  const image = decodeDataUrl(input.image.dataUrl);
  const extension = extensionForMimeType(image.mimeType);
  const datePrefix = input.createdAt || new Date().toISOString().slice(0, 10);
  const fileSlug = slugify(input.title || input.image.fileName);
  const objectPath = `gallery/${input.category}/${datePrefix}-${fileSlug}-${crypto.randomUUID()}.${extension}`;
  const serviceKey = requireSupabaseServiceKey();
  const response = await fetch(`${getSupabaseUrl()}/storage/v1/object/${encodeStorageTarget(getBucketName(), objectPath)}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": image.mimeType,
      "x-upsert": "false",
    },
    body: image.buffer,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return objectPath;
}

async function removeImage(objectPath: string) {
  const serviceKey = requireSupabaseServiceKey();
  const response = await fetch(`${getSupabaseUrl()}/storage/v1/object/${encodeStorageTarget(getBucketName())}`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [objectPath] }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function getGalleryPayload(includeDrafts = false): Promise<GalleryDataPayload> {
  const groups = await getGroups();
  const publishedFilter = includeDrafts ? "" : "&published=eq.true";
  const records = await supabaseRestFetch<GalleryItemRecord[]>(
    `/gallery_items?select=*&order=sort_order.asc${publishedFilter}`,
  );

  return {
    groups,
    items: records.map((record) => mapItem(record, groups)),
  };
}

export async function createGalleryItem(input: GalleryCreateInput) {
  const groups = await getGroups();
  const group = groups.find((candidate) => candidate.id === input.category);

  if (!input.title.trim() || !group) {
    throw new Error("Title and group are required.");
  }

  const imagePath = await uploadImage(input);
  const sortOrder = await getNextSortOrder("gallery_items");
  const id = crypto.randomUUID();
  const record = {
    id,
    title: input.title.trim(),
    group_id: group.id,
    image_path: imagePath,
    alt: `${input.title.trim()} - ${group.label}`,
    etiquetas: input.etiquetas,
    colors: input.colors,
    featured: input.featured,
    published: input.published,
    work_date: input.createdAt || new Date().toISOString().slice(0, 10),
    sort_order: sortOrder,
  };
  const rows = await supabaseRestFetch<GalleryItemRecord[]>("/gallery_items", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(record),
  });

  return mapItem(rows[0], groups);
}

export async function updateGalleryItem(id: string, update: GalleryUpdateInput) {
  const payload: Partial<GalleryItemRecord> = {};

  if (typeof update.title === "string") payload.title = update.title.trim();
  if (typeof update.category === "string") payload.group_id = update.category;
  if (Array.isArray(update.etiquetas)) payload.etiquetas = update.etiquetas;
  if (Array.isArray(update.colors)) payload.colors = update.colors;
  if (typeof update.alt === "string") payload.alt = update.alt;
  if (typeof update.featured === "boolean") payload.featured = update.featured;
  if (typeof update.published === "boolean") payload.published = update.published;
  if (typeof update.createdAt === "string") payload.work_date = update.createdAt;
  if (typeof update.sortOrder === "number") payload.sort_order = update.sortOrder;

  const rows = await supabaseRestFetch<GalleryItemRecord[]>(`/gallery_items?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const groups = await getGroups();

  return mapItem(rows[0], groups);
}

export async function deleteGalleryItem(id: string) {
  const rows = await supabaseRestFetch<GalleryItemRecord[]>(`/gallery_items?id=eq.${encodeURIComponent(id)}&select=*`);

  if (!rows[0]) {
    return;
  }

  await removeImage(rows[0].image_path);
  await supabaseRestFetch<null>(`/gallery_items?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function createGalleryGroup(label: string) {
  const cleanLabel = label.trim();

  if (!cleanLabel) {
    throw new Error("Group label is required.");
  }

  const groups = await getGroups();
  const baseId = slugify(cleanLabel);
  let id = baseId;
  let suffix = 2;

  while (groups.some((group) => group.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const rows = await supabaseRestFetch<GalleryGroupRecord[]>("/gallery_groups", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ id, label: cleanLabel, sort_order: await getNextSortOrder("gallery_groups") }),
  });

  return mapGroup(rows[0]);
}

export async function updateGalleryGroup(id: string, label: string) {
  const rows = await supabaseRestFetch<GalleryGroupRecord[]>(`/gallery_groups?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ label: label.trim() }),
  });

  return mapGroup(rows[0]);
}

export async function deleteGalleryGroup(id: string) {
  const groups = await getGroups();
  const fallbackGroup = groups.find((group) => group.id !== id);

  if (!fallbackGroup) {
    throw new Error("At least one group is required.");
  }

  await supabaseRestFetch<null>(`/gallery_items?group_id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ group_id: fallbackGroup.id }),
  });
  await supabaseRestFetch<null>(`/gallery_groups?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}
