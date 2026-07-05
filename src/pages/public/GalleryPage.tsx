import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import { GalleryFilters } from "../../features/gallery/GalleryFilters";
import { GalleryGrid } from "../../features/gallery/GalleryGrid";
import { useGalleryData } from "../../features/gallery/GalleryDataContext";
import {
  filterGalleryItems,
  getCategoryOptions,
  getColorOptions,
  getEtiquetaOptions,
  getPublishedGalleryItems,
  sortGalleryItems,
  type GalleryFilter,
  type GallerySort,
} from "../../features/gallery/gallery.utils";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sort, setSort] = useState<GallerySort>("newest");
  const { items, groups } = useGalleryData();
  const publishedItems = useMemo(() => getPublishedGalleryItems(items), [items]);
  const categories = useMemo(() => getCategoryOptions(publishedItems, groups), [groups, publishedItems]);
  const etiquetas = useMemo(() => getEtiquetaOptions(publishedItems), [publishedItems]);
  const colors = useMemo(() => getColorOptions(publishedItems), [publishedItems]);
  const filteredItems = useMemo(
    () => sortGalleryItems(filterGalleryItems(publishedItems, activeFilter, selectedEtiquetas, selectedColors), sort),
    [activeFilter, publishedItems, selectedColors, selectedEtiquetas, sort],
  );

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
        <GalleryFilters
          categories={categories}
          etiquetas={etiquetas}
          colors={colors}
          activeFilter={activeFilter}
          selectedEtiquetas={selectedEtiquetas}
          selectedColors={selectedColors}
          sort={sort}
          onCategoryChange={setActiveFilter}
          onEtiquetasChange={setSelectedEtiquetas}
          onColorsChange={setSelectedColors}
          onSortChange={setSort}
        />
        <GalleryGrid items={filteredItems} />
      </div>
    </section>
  );
}
