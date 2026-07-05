export type GalleryCategory =
  | "sillas"
  | "mesas-sillas"
  | "carteles"
  | "packs"
  | "cajas"
  | "bandejas"
  | "otros";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  alt: string;
  thumbnailUrl: string;
  fullUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  sortOrder: number;
};
