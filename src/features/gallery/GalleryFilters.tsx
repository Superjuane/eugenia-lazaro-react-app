import type { GalleryCategory } from "../../shared/types/gallery";
import type { GalleryFilter } from "./gallery.utils";

type GalleryFiltersProps = {
  categories: Array<{ id: GalleryCategory; label: string }>;
  activeFilter: GalleryFilter;
  onChange: (filter: GalleryFilter) => void;
};

export function GalleryFilters({ categories, activeFilter, onChange }: GalleryFiltersProps) {
  return (
    <div className="gallery-filters" aria-label="Filtros de galeria">
      <button className={activeFilter === "all" ? "is-active" : ""} type="button" onClick={() => onChange("all")}>
        Todo
      </button>
      {categories.map((category) => (
        <button
          className={activeFilter === category.id ? "is-active" : ""}
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
