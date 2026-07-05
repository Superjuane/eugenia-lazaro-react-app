import type { GalleryGroup, GalleryItem } from "../../shared/types/gallery";

export type GalleryFilter = string | "all";
export type GallerySort = "newest" | "oldest" | "featured" | "manual";

export function getPublishedGalleryItems(items: GalleryItem[]) {
  return items.filter((item) => item.published);
}

export function getFeaturedGalleryItems(items: GalleryItem[]) {
  return getPublishedGalleryItems(items).filter((item) => item.featured);
}

export function sortGalleryItems(items: GalleryItem[], sort: GallerySort) {
  return [...items].sort((first, second) => {
    if (sort === "featured") {
      return Number(second.featured) - Number(first.featured) || first.sortOrder - second.sortOrder;
    }

    if (sort === "oldest") {
      return first.createdAt.localeCompare(second.createdAt) || first.sortOrder - second.sortOrder;
    }

    if (sort === "manual") {
      return first.sortOrder - second.sortOrder;
    }

    return second.createdAt.localeCompare(first.createdAt) || first.sortOrder - second.sortOrder;
  });
}

export function getCategoryOptions(items: GalleryItem[], groups: GalleryGroup[]) {
  const visibleCategories = new Set(items.map((item) => item.category));
  const categoriesFromItems = Array.from(visibleCategories)
    .filter((category) => !groups.some((group) => group.id === category))
    .map((category) => ({
      id: category,
      label: items.find((item) => item.category === category)?.categoryLabel ?? category,
    }));

  return [...groups.filter((group) => visibleCategories.has(group.id)), ...categoriesFromItems];
}

export function getEtiquetaOptions(items: GalleryItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.etiquetas))).sort((first, second) => first.localeCompare(second));
}

export function getColorOptions(items: GalleryItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.colors))).sort((first, second) => first.localeCompare(second));
}

export function filterGalleryItems(
  items: GalleryItem[],
  categoryFilter: GalleryFilter,
  selectedEtiquetas: string[],
  selectedColors: string[],
) {
  return items.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesEtiquetas = selectedEtiquetas.length === 0 || selectedEtiquetas.some((etiqueta) => item.etiquetas.includes(etiqueta));
    const matchesColors = selectedColors.length === 0 || selectedColors.some((color) => item.colors.includes(color));

    return matchesCategory && matchesEtiquetas && matchesColors;
  });
}
