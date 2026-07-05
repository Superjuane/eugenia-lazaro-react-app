/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { GalleryGroup, GalleryItem } from "../../shared/types/gallery";
import { galleryGroups, galleryItems } from "./data/gallery.data";

const STORAGE_KEY = "eugenia-gallery-admin-data";
const GROUPS_STORAGE_KEY = "eugenia-gallery-groups";

type NewGalleryItem = Omit<GalleryItem, "id" | "sortOrder" | "createdAt"> & {
  createdAt?: string;
};

type GalleryDataContextValue = {
  items: GalleryItem[];
  groups: GalleryGroup[];
  addItem: (item: NewGalleryItem) => void;
  updateItem: (id: string, update: Partial<GalleryItem>) => void;
  deleteItem: (id: string) => void;
  addGroup: (label: string) => void;
  updateGroup: (id: string, label: string) => void;
  deleteGroup: (id: string) => void;
  resetItems: () => void;
};

const GalleryDataContext = createContext<GalleryDataContextValue | null>(null);

type StoredGalleryItem = GalleryItem & {
  tags?: string[];
  labels?: string[];
  color?: string | string[];
};

function toUniqueList(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "grupo"
  );
}

function normalizeGroups(groups: GalleryGroup[]) {
  return groups
    .map((group) => ({
      id: group.id || slugify(group.label),
      label: group.label.trim(),
    }))
    .filter((group) => group.label);
}

function normalizeItems(items: StoredGalleryItem[]) {
  return items.map((item) => {
    const { tags, labels, color, ...baseItem } = item;
    const legacyColor = Array.isArray(color) ? color : color ? [color] : [];

    return {
      ...baseItem,
      etiquetas: item.etiquetas?.length ? item.etiquetas : toUniqueList([...(tags ?? []), ...(labels ?? [])]),
      colors: item.colors?.length ? item.colors : toUniqueList(legacyColor),
      createdAt: item.createdAt ?? new Date().toISOString().slice(0, 10),
    };
  });
}

function loadInitialItems() {
  const storedItems = window.localStorage.getItem(STORAGE_KEY);

  if (!storedItems) {
    return normalizeItems(galleryItems);
  }

  try {
    return normalizeItems(JSON.parse(storedItems) as StoredGalleryItem[]);
  } catch {
    return normalizeItems(galleryItems);
  }
}

function loadInitialGroups() {
  const storedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY);

  if (!storedGroups) {
    return normalizeGroups(galleryGroups);
  }

  try {
    return normalizeGroups(JSON.parse(storedGroups) as GalleryGroup[]);
  } catch {
    return normalizeGroups(galleryGroups);
  }
}

export function GalleryDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GalleryItem[]>(loadInitialItems);
  const [groups, setGroups] = useState<GalleryGroup[]>(loadInitialGroups);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  function addItem(item: NewGalleryItem) {
    setItems((currentItems) => {
      const nextSortOrder = currentItems.reduce((max, current) => Math.max(max, current.sortOrder), 0) + 1;
      const id = `admin-${Date.now()}`;

      return [
        {
          ...item,
          id,
          createdAt: item.createdAt ?? new Date().toISOString().slice(0, 10),
          sortOrder: nextSortOrder,
        },
        ...currentItems,
      ];
    });
  }

  function updateItem(id: string, update: Partial<GalleryItem>) {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }

  function deleteItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function addGroup(label: string) {
    const cleanLabel = label.trim();

    if (!cleanLabel) {
      return;
    }

    setGroups((currentGroups) => {
      const baseId = slugify(cleanLabel);
      let id = baseId;
      let suffix = 2;

      while (currentGroups.some((group) => group.id === id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      return [...currentGroups, { id, label: cleanLabel }];
    });
  }

  function updateGroup(id: string, label: string) {
    const cleanLabel = label.trim();

    if (!cleanLabel) {
      return;
    }

    setGroups((currentGroups) => currentGroups.map((group) => (group.id === id ? { ...group, label: cleanLabel } : group)));
    setItems((currentItems) =>
      currentItems.map((item) => (item.category === id ? { ...item, categoryLabel: cleanLabel, alt: `${item.title} - ${cleanLabel}` } : item)),
    );
  }

  function deleteGroup(id: string) {
    setGroups((currentGroups) => {
      if (currentGroups.length <= 1) {
        return currentGroups;
      }

      const nextGroups = currentGroups.filter((group) => group.id !== id);
      const fallbackGroup = nextGroups[0];

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.category === id
            ? { ...item, category: fallbackGroup.id, categoryLabel: fallbackGroup.label, alt: `${item.title} - ${fallbackGroup.label}` }
            : item,
        ),
      );

      return nextGroups;
    });
  }

  function resetItems() {
    setItems(normalizeItems(galleryItems));
    setGroups(normalizeGroups(galleryGroups));
  }

  return (
    <GalleryDataContext.Provider value={{ items, groups, addItem, updateItem, deleteItem, addGroup, updateGroup, deleteGroup, resetItems }}>
      {children}
    </GalleryDataContext.Provider>
  );
}

export function useGalleryData() {
  const value = useContext(GalleryDataContext);

  if (!value) {
    throw new Error("useGalleryData must be used inside GalleryDataProvider");
  }

  return value;
}
