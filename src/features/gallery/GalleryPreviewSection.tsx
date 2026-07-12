import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { useGalleryData } from "./GalleryDataContext";
import { GalleryGrid } from "./GalleryGrid";
import { getFeaturedGalleryItems } from "./gallery.utils";

export function GalleryPreviewSection() {
  const { items } = useGalleryData();
  const featuredItems = getFeaturedGalleryItems(items);

  function handleGalleryClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    navigateTo("/Gallery");
  }

  return (
    <section className="page-section" id="gallery">
      <div className="section-container">
        <SectionHeader
          eyebrow="Galería"
          title="Trabajos destacados"
          description="Una selección configurable de piezas recientes. La galería completa reúne todos los trabajos disponibles."
        />
        <GalleryGrid items={featuredItems} />
        <div className="section-actions">
          <a className="secondary-action" href="/Gallery" onClick={handleGalleryClick}>
            Ver galería completa
          </a>
        </div>
      </div>
    </section>
  );
}
