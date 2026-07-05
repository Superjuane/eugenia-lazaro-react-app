import { useState } from "react";
import type { GalleryItem } from "../../shared/types/gallery";
import { GalleryCard } from "./GalleryCard";
import { GalleryLightbox } from "./GalleryLightbox";

type GalleryGridProps = {
  items: GalleryItem[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

  function openItem(item: GalleryItem) {
    const nextIndex = items.findIndex((candidate) => candidate.id === item.id);

    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  }

  function showPreviousItem() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex - 1 + items.length) % items.length;
    });
  }

  function showNextItem() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex + 1) % items.length;
    });
  }

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <GalleryCard item={item} key={item.id} onOpen={openItem} />
        ))}
      </div>
      <GalleryLightbox item={activeItem} onClose={() => setActiveIndex(null)} onNext={showNextItem} onPrevious={showPreviousItem} />
    </>
  );
}
