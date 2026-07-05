import { useEffect } from "react";
import type { GalleryItem } from "../../shared/types/gallery";

type GalleryLightboxProps = {
  item: GalleryItem | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function GalleryLightbox({ item, onClose, onNext, onPrevious }: GalleryLightboxProps) {
  useEffect(() => {
    if (!item) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrevious();
      }
    };

    document.body.classList.add("has-lightbox");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("has-lightbox");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, onClose, onNext, onPrevious]);

  if (!item) {
    return null;
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <button className="lightbox-backdrop" type="button" aria-label="Cerrar imagen" onClick={onClose} />
      <figure className="lightbox-content">
        <button className="lightbox-close" type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <button className="lightbox-arrow lightbox-arrow-left" type="button" onClick={onPrevious} aria-label="Imagen anterior">
          ‹
        </button>
        <img src={item.fullUrl} alt={item.alt} />
        <button className="lightbox-arrow lightbox-arrow-right" type="button" onClick={onNext} aria-label="Imagen siguiente">
          ›
        </button>
        <figcaption>
          <span>{item.categoryLabel}</span>
          <strong>{item.title}</strong>
        </figcaption>
      </figure>
    </div>
  );
}
