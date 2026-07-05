export type GalleryGroup = {
  id: string;
  label: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  etiquetas: string[];
  colors: string[];
  alt: string;
  thumbnailUrl: string;
  fullUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  sortOrder: number;
};
