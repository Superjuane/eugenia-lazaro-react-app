import type { GalleryCategory, GalleryItem } from "../../shared/types/gallery";
import { galleryCategoryLabels, galleryItems } from "./data/gallery.data";

export type GalleryFilter = GalleryCategory | "all";

export function getPublishedGalleryItems() {
  return galleryItems.filter((item) => item.published);
}

export function getFeaturedGalleryItems() {
  return getPublishedGalleryItems().filter((item) => item.featured);
}

export function getNewestGalleryItems() {
  return [...getPublishedGalleryItems()].sort((first, second) => {
    const dateComparison = second.createdAt.localeCompare(first.createdAt);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return first.sortOrder - second.sortOrder;
  });
}

export function getCategoryOptions(items: GalleryItem[]) {
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return categories.map((category) => ({
    id: category,
    label: galleryCategoryLabels[category],
  }));
}

export function filterGalleryItems(items: GalleryItem[], filter: GalleryFilter) {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.category === filter);
}
