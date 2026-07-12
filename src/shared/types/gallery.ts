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

export type GalleryImageUpload = {
  dataUrl: string;
  fileName: string;
  mimeType: string;
};

export type GalleryCreateInput = {
  title: string;
  category: string;
  etiquetas: string[];
  colors: string[];
  image: GalleryImageUpload;
  featured: boolean;
  published: boolean;
  createdAt?: string;
};

export type GalleryDataPayload = {
  items: GalleryItem[];
  groups: GalleryGroup[];
};
