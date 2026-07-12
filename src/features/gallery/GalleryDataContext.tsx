/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { GalleryCreateInput, GalleryDataPayload, GalleryGroup, GalleryItem } from "../../shared/types/gallery";
import { galleryGroups, galleryItems } from "./data/gallery.data";

type GalleryDataContextValue = {
  items: GalleryItem[];
  groups: GalleryGroup[];
  isLoading: boolean;
  error: string;
  addItem: (item: GalleryCreateInput) => Promise<void>;
  updateItem: (id: string, update: Partial<GalleryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addGroup: (label: string) => Promise<void>;
  updateGroup: (id: string, label: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  resetItems: () => Promise<void>;
};

const GalleryDataContext = createContext<GalleryDataContextValue | null>(null);

function normalizeGroups(groups: GalleryGroup[]) {
  return groups
    .map((group) => ({
      id: group.id,
      label: group.label.trim(),
    }))
    .filter((group) => group.id && group.label);
}

function fallbackPayload(): GalleryDataPayload {
  return {
    items: galleryItems,
    groups: normalizeGroups(galleryGroups),
  };
}

async function readJson<T>(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Gallery request failed");
  }

  return payload as T;
}

export function GalleryDataProvider({ children }: { children: ReactNode }) {
  const fallback = fallbackPayload();
  const [items, setItems] = useState<GalleryItem[]>(fallback.items);
  const [groups, setGroups] = useState<GalleryGroup[]>(fallback.groups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGallery() {
    setIsLoading(true);

    try {
      const payload = await readJson<GalleryDataPayload>(
        await fetch("/api/gallery?scope=admin", {
          credentials: "include",
        }),
      );

      setItems(payload.items);
      setGroups(payload.groups);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar la galeria desde Supabase.");
      setItems(fallback.items);
      setGroups(fallback.groups);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addItem(item: GalleryCreateInput) {
    const createdItem = await readJson<GalleryItem>(
      await fetch("/api/gallery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }),
    );

    setItems((currentItems) => [createdItem, ...currentItems]);
    setError("");
  }

  async function updateItem(id: string, update: Partial<GalleryItem>) {
    const updatedItem = await readJson<GalleryItem>(
      await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }),
    );

    setItems((currentItems) => currentItems.map((item) => (item.id === id ? updatedItem : item)));
    setError("");
  }

  async function deleteItem(id: string) {
    await readJson<{ ok: true }>(
      await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      }),
    );

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setError("");
  }

  async function addGroup(label: string) {
    const group = await readJson<GalleryGroup>(
      await fetch("/api/gallery/groups", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }),
    );

    setGroups((currentGroups) => [...currentGroups, group]);
    setError("");
  }

  async function updateGroup(id: string, label: string) {
    const group = await readJson<GalleryGroup>(
      await fetch(`/api/gallery/groups/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }),
    );

    setGroups((currentGroups) => currentGroups.map((currentGroup) => (currentGroup.id === id ? group : currentGroup)));
    setItems((currentItems) =>
      currentItems.map((item) => (item.category === id ? { ...item, categoryLabel: group.label, alt: `${item.title} - ${group.label}` } : item)),
    );
    setError("");
  }

  async function deleteGroup(id: string) {
    await readJson<{ ok: true }>(
      await fetch(`/api/gallery/groups/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      }),
    );

    await loadGallery();
  }

  return (
    <GalleryDataContext.Provider
      value={{ items, groups, isLoading, error, addItem, updateItem, deleteItem, addGroup, updateGroup, deleteGroup, resetItems: loadGallery }}
    >
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
