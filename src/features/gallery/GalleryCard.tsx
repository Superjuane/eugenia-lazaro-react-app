import type { GalleryItem } from "../../shared/types/gallery";
import { useAdminAuth } from "../admin/AdminAuthContext";
import { useGalleryData } from "./GalleryDataContext";

type GalleryCardProps = {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
};

export function GalleryCard({ item, onOpen }: GalleryCardProps) {
  const { session } = useAdminAuth();
  const { updateItem } = useGalleryData();

  return (
    <button className="gallery-card" type="button" onClick={() => onOpen(item)}>
      <img src={item.thumbnailUrl} alt={item.alt} loading="lazy" />
      {session.authenticated ? (
        <span className="gallery-admin-actions" onClick={(event) => event.stopPropagation()}>
          <span
            role="button"
            tabIndex={0}
            onClick={() => updateItem(item.id, { featured: !item.featured })}
            onKeyDown={(event) => {
              if (event.key === "Enter") updateItem(item.id, { featured: !item.featured });
            }}
          >
            {item.featured ? "Quitar destacada" : "Destacar"}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => updateItem(item.id, { published: !item.published })}
            onKeyDown={(event) => {
              if (event.key === "Enter") updateItem(item.id, { published: !item.published });
            }}
          >
            {item.published ? "Ocultar" : "Publicar"}
          </span>
        </span>
      ) : null}
      <span className="gallery-card-overlay">
        <span>{item.categoryLabel}</span>
        <strong>{item.title}</strong>
        {item.colors.length ? <small>{item.colors.join(", ")}</small> : null}
      </span>
    </button>
  );
}
