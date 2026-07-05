import { useEffect } from "react";
import type { GalleryItem } from "../../shared/types/gallery";

type GalleryLightboxProps = {
  item: GalleryItem | null;
  onClose: () => void;
};

export function GalleryLightbox({ item, onClose }: GalleryLightboxProps) {
  useEffect(() => {
    if (!item) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("has-lightbox");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("has-lightbox");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, onClose]);

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
        <img src={item.fullUrl} alt={item.alt} />
        <figcaption>
          <span>{item.categoryLabel}</span>
          <strong>{item.title}</strong>
        </figcaption>
      </figure>
    </div>
  );
}
