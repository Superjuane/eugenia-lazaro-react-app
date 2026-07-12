import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const galleryDataFile = path.join(appRoot, "src/features/gallery/data/gallery.data.ts");
const envFiles = [".env.local", ".env"];

function loadEnvFile(fileName) {
  const filePath = path.join(appRoot, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex < 0) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

envFiles.forEach(loadEnvFile);

const supabaseUrl = (process.env.SUPABASE_URL ?? "https://pzxgkiqvnyydqauzdvgv.supabase.co").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "Eugenia Lazaro Pintura - imagenes publicas";

if (!serviceKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
}

function extractExportedArray(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);

  if (start < 0) {
    throw new Error(`Could not find ${exportName}.`);
  }

  const assignmentStart = source.indexOf("=", start);
  const arrayStart = source.indexOf("[", assignmentStart);
  let depth = 0;

  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === "[") {
      depth += 1;
    }

    if (character === "]") {
      depth -= 1;
    }

    if (depth === 0) {
      return Function(`return ${source.slice(arrayStart, index + 1)}`)();
    }
  }

  throw new Error(`Could not parse ${exportName}.`);
}

function encodeStorageTarget(bucket, objectPath) {
  return `${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

function mimeTypeForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

function destinationPath(item) {
  const sourceName = path.basename(item.fullUrl);
  return `gallery/${item.category}/${item.id}-${sourceName}`;
}

async function supabaseRest(pathName, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1${pathName}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function uploadObject(objectPath, filePath) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${encodeStorageTarget(bucketName, objectPath)}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": mimeTypeForFile(filePath),
      "x-upsert": "true",
    },
    body: fs.readFileSync(filePath),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

const source = fs.readFileSync(galleryDataFile, "utf8");
const groups = extractExportedArray(source, "galleryGroups");
const items = extractExportedArray(source, "galleryItems");

await supabaseRest("/gallery_groups?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates" },
  body: JSON.stringify(
    groups.map((group, index) => ({
      id: group.id,
      label: group.label,
      sort_order: index + 1,
    })),
  ),
});

let uploaded = 0;

for (const item of items) {
  const sourcePath = path.join(appRoot, "public", item.fullUrl.replace(/^\//, ""));
  const objectPath = destinationPath(item);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing local file: ${sourcePath}`);
  }

  await uploadObject(objectPath, sourcePath);
  uploaded += 1;

  await supabaseRest("/gallery_items?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: item.id,
      title: item.title,
      group_id: item.category,
      image_path: objectPath,
      alt: item.alt,
      etiquetas: item.etiquetas,
      colors: item.colors,
      featured: item.featured,
      published: item.published,
      work_date: item.createdAt,
      sort_order: item.sortOrder,
    }),
  });
}

console.log(
  JSON.stringify(
    {
      groups: groups.length,
      items: items.length,
      uploaded,
      bucketName,
    },
    null,
    2,
  ),
);
