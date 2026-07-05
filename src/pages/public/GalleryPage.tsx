import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import { GalleryFilters } from "../../features/gallery/GalleryFilters";
import { GalleryGrid } from "../../features/gallery/GalleryGrid";
import {
  filterGalleryItems,
  getCategoryOptions,
  getNewestGalleryItems,
  type GalleryFilter,
} from "../../features/gallery/gallery.utils";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const newestItems = useMemo(() => getNewestGalleryItems(), []);
  const categories = useMemo(() => getCategoryOptions(newestItems), [newestItems]);
  const filteredItems = useMemo(() => filterGalleryItems(newestItems, activeFilter), [newestItems, activeFilter]);

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    navigateTo("/");
  }

  return (
    <section className="gallery-page">
      <div className="section-container">
        <a className="back-link" href="/" onClick={handleHomeClick}>
          ← Volver al inicio
        </a>
        <SectionHeader
          eyebrow="Galería completa"
          title="Todas las piezas"
          description="Filtra por categoría o abre cualquier imagen para verla en grande."
        />
        <GalleryFilters categories={categories} activeFilter={activeFilter} onChange={setActiveFilter} />
        <GalleryGrid items={filteredItems} />
      </div>
    </section>
  );
}
