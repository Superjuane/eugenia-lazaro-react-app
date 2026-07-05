import { useState } from "react";
import type { GalleryItem } from "../../shared/types/gallery";
import { GalleryCard } from "./GalleryCard";
import { GalleryLightbox } from "./GalleryLightbox";

type GalleryGridProps = {
  items: GalleryItem[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <GalleryCard item={item} key={item.id} onOpen={setActiveItem} />
        ))}
      </div>
      <GalleryLightbox item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
