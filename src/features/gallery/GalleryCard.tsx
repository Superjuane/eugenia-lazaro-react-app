import type { GalleryItem } from "../../shared/types/gallery";

type GalleryCardProps = {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
};

export function GalleryCard({ item, onOpen }: GalleryCardProps) {
  return (
    <button className="gallery-card" type="button" onClick={() => onOpen(item)}>
      <img src={item.thumbnailUrl} alt={item.alt} loading="lazy" />
      <span className="gallery-card-overlay">
        <span>{item.categoryLabel}</span>
        <strong>{item.title}</strong>
      </span>
    </button>
  );
}
