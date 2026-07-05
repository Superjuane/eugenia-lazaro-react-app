import fs from "node:fs";
import path from "node:path";

const legacyRoot = "C:/Users/juane/Documents/Projects/EugeniaLazaro.com";
const appRoot = process.cwd();
const legacyGalleryFile = path.join(legacyRoot, "react/MainGallery.js");
const galleryAssetsDir = path.join(appRoot, "public/images/gallery");
const galleryDataDir = path.join(appRoot, "src/features/gallery/data");
const galleryDataFile = path.join(galleryDataDir, "gallery.data.ts");

const categoryMap = {
  Pack: ["packs", "Packs"],
  Cartel: ["carteles", "Carteles"],
  mesaSilla: ["mesas-sillas", "Mesas con sillas"],
  Sillas: ["sillas", "Sillas"],
  Cajas: ["cajas", "Cajas"],
  Bandejas: ["bandejas", "Bandejas"],
  Otro: ["otros", "Otros"],
};

function slugify(value) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "pieza"
  );
}

function fixLegacyPath(filePath, fallbackPath) {
  if (filePath === "images/workE/bandeja-1-big.pn") {
    return "images/workE/bandeja-1-big.png";
  }

  if (filePath === "images/workE/sillaMesa-4-big.jpeg") {
    return fallbackPath;
  }

  return filePath;
}

function destinationName(filePath) {
  return filePath.replace(/^images\/workE\//, "").replace(/\\/g, "/");
}

function decodeLegacyText(value) {
  return Buffer.from(value, "latin1").toString("utf8");
}

function readLegacyItems() {
  const source = fs.readFileSync(legacyGalleryFile, "utf8");
  const start = source.indexOf("const data = [");
  const end = source.indexOf("];", start) + 1;
  const arrayText = source.slice(source.indexOf("[", start), end);

  return Function(`return ${arrayText}`)();
}

function copyAsset(relativePath) {
  const cleanName = destinationName(relativePath);
  const sourcePath = path.join(legacyRoot, relativePath);
  const destinationPath = path.join(galleryAssetsDir, cleanName);

  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  fs.copyFileSync(sourcePath, destinationPath);
  return true;
}

fs.rmSync(galleryAssetsDir, { recursive: true, force: true });
fs.mkdirSync(galleryAssetsDir, { recursive: true });
fs.mkdirSync(galleryDataDir, { recursive: true });

const copied = new Set();
const galleryItems = readLegacyItems()
  .map((item, index) => {
    const category = categoryMap[item.mixClass];

    if (!category) {
      return null;
    }

    const thumbnailPath = fixLegacyPath(item.imgSrc, item.imgSrc);
    const fullPath = fixLegacyPath(item.overlayLink, thumbnailPath);
    const fullPathExists = fs.existsSync(path.join(legacyRoot, fullPath));
    const safeFullPath = fullPathExists ? fullPath : thumbnailPath;

    const assetName = destinationName(safeFullPath);

    if (!copied.has(assetName) && copyAsset(safeFullPath)) {
      copied.add(assetName);
    }

    return {
      id: `${String(index + 1).padStart(3, "0")}-${slugify(decodeLegacyText(item.overlayTitle))}`,
      title: decodeLegacyText(item.overlayTitle).replace(/^>/, ""),
      category: category[0],
      categoryLabel: category[1],
      thumbnailUrl: `/images/gallery/${destinationName(safeFullPath)}`,
      fullUrl: `/images/gallery/${destinationName(safeFullPath)}`,
      alt: decodeLegacyText(item.overlayLinkTitle || item.overlayTitle),
      featured: index < 12,
      published: true,
      createdAt:
        index < 15
          ? "2023-10-01"
          : index < 20
            ? "2023-04-10"
            : index < 24
              ? "2023-04-20"
              : "2023-01-01",
      sortOrder: index + 1,
    };
  })
  .filter(Boolean);

const output = `import type { GalleryItem } from "../../../shared/types/gallery";

export const galleryItems: GalleryItem[] = ${JSON.stringify(galleryItems, null, 2)};

export const galleryCategoryLabels: Record<GalleryItem["category"], string> = {
  packs: "Packs",
  carteles: "Carteles",
  "mesas-sillas": "Mesas con sillas",
  sillas: "Sillas",
  cajas: "Cajas",
  bandejas: "Bandejas",
  otros: "Otros",
};
`;

fs.writeFileSync(galleryDataFile, output, "utf8");

const counts = galleryItems.reduce((accumulator, item) => {
  accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
  return accumulator;
}, {});

console.log(
  JSON.stringify(
    {
      items: galleryItems.length,
      filesCopied: copied.size,
      counts,
    },
    null,
    2,
  ),
);
