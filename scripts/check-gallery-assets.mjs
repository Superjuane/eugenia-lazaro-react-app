import fs from "node:fs";

const galleryData = fs.readFileSync("src/features/gallery/data/gallery.data.ts", "utf8");
const assetPaths = Array.from(galleryData.matchAll(/"\/(images\/gallery\/[^"]+)"/g)).map((match) => match[1]);
const missing = assetPaths.filter((assetPath) => !fs.existsSync(`public/${assetPath}`));

if (missing.length > 0) {
  console.error(
    JSON.stringify(
      {
        checked: assetPaths.length,
        missingCount: missing.length,
        missing,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      checked: assetPaths.length,
      missingCount: 0,
    },
    null,
    2,
  ),
);
