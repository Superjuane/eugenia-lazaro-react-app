import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { navigateTo } from "../../app/navigation";
import { useAdminAuth } from "../../features/admin/AdminAuthContext";
import { useGalleryData } from "../../features/gallery/GalleryDataContext";
import type { GalleryImageUpload, GalleryItem } from "../../shared/types/gallery";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSide = 2200;

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo preparar la imagen."));
    image.src = url;
  });
}

async function optimizeImage(file: File): Promise<GalleryImageUpload> {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Formato no soportado. Usa JPG, PNG o WebP.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxImageSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo preparar la imagen.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));

    if (!blob) {
      throw new Error("No se pudo optimizar la imagen.");
    }

    return {
      dataUrl: await readBlobAsDataUrl(blob),
      fileName: file.name.replace(/\.[^.]+$/, ".webp"),
      mimeType: "image/webp",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function AdminPage() {
  const { session, isLoading: isAuthLoading, login, logout } = useAdminAuth();
  const {
    items,
    groups,
    isLoading: isGalleryLoading,
    error: galleryError,
    addItem,
    updateItem,
    deleteItem,
    addGroup,
    updateGroup,
    deleteGroup,
    resetItems,
  } = useGalleryData();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [newItem, setNewItem] = useState({
    title: "",
    category: "sillas",
    image: null as GalleryImageUpload | null,
    etiquetas: "",
    colors: "",
    createdAt: "",
    published: false,
    featured: false,
  });

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await login(credentials.username, credentials.password);

    if (!success) {
      setLoginError("Credenciales incorrectas o variables de entorno sin configurar.");
      return;
    }

    setLoginError("");
    await resetItems();
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setNewItem({ ...newItem, image: null });
      return;
    }

    try {
      setAdminError("");
      const image = await optimizeImage(file);
      setNewItem((currentItem) => ({ ...currentItem, image }));
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "No se pudo preparar la imagen.");
    }
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedGroup = groups.find((group) => group.id === newItem.category) ?? groups[0];

    if (!newItem.image || !selectedGroup) {
      return;
    }

    try {
      setIsSaving(true);
      setAdminError("");
      await addItem({
        title: newItem.title,
        category: selectedGroup.id,
        etiquetas: toList(newItem.etiquetas),
        colors: toList(newItem.colors),
        image: newItem.image,
        featured: newItem.featured,
        published: newItem.published,
        createdAt: newItem.createdAt || undefined,
      });

      setNewItem({
        title: "",
        category: groups[0]?.id ?? "",
        image: null,
        etiquetas: "",
        colors: "",
        createdAt: "",
        published: false,
        featured: false,
      });
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "No se pudo guardar la imagen.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await addGroup(newGroupLabel);
      setNewGroupLabel("");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "No se pudo guardar el grupo.");
    }
  }

  async function updateItemGroup(item: GalleryItem, groupId: string) {
    const selectedGroup = groups.find((group) => group.id === groupId);

    if (!selectedGroup) {
      return;
    }

    await updateItem(item.id, {
      category: selectedGroup.id,
      categoryLabel: selectedGroup.label,
      alt: `${item.title} - ${selectedGroup.label}`,
    });
  }

  async function updateEtiquetas(item: GalleryItem, value: string) {
    await updateItem(item.id, { etiquetas: toList(value) });
  }

  async function updateColors(item: GalleryItem, value: string) {
    await updateItem(item.id, { colors: toList(value) });
  }

  if (isAuthLoading) {
    return <section className="admin-page admin-login-page">Cargando...</section>;
  }

  if (!session.authenticated) {
    return (
      <section className="admin-page admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <p className="eyebrow">Admin</p>
          <h1>Acceso privado</h1>
          <label>
            Usuario
            <input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            />
          </label>
          <button className="form-submit" type="submit">
            Entrar
          </button>
          {loginError ? <p className="form-status form-status-error">{loginError}</p> : null}
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="section-container admin-shell">
        <aside className="admin-sidebar">
          <strong>Eugenia Pintura</strong>
          <button type="button" onClick={() => navigateTo("/")}>
            Ver web
          </button>
          <button type="button" onClick={() => void logout()}>
            Cerrar sesion
          </button>
          <button type="button" onClick={() => void resetItems()}>
            Recargar datos
          </button>
        </aside>

        <div className="admin-main">
          <header className="admin-heading">
            <p className="eyebrow">Dashboard</p>
            <h1>Galeria e imagenes</h1>
          </header>

          <form className="admin-panel admin-add-form" onSubmit={handleAddItem}>
            <h2>Anadir imagen</h2>
            <label className="admin-upload-field">
              Imagen
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleImageUpload(event)} required={!newItem.image} />
            </label>
            {newItem.image ? <img className="admin-upload-preview" src={newItem.image.dataUrl} alt="Vista previa" /> : null}
            <input placeholder="Titulo" value={newItem.title} onChange={(event) => setNewItem({ ...newItem, title: event.target.value })} required />
            <select
              value={newItem.category}
              onChange={(event) => setNewItem({ ...newItem, category: event.target.value })}
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Etiquetas separadas por coma"
              value={newItem.etiquetas}
              onChange={(event) => setNewItem({ ...newItem, etiquetas: event.target.value })}
            />
            <input
              placeholder="Color separado por coma"
              value={newItem.colors}
              onChange={(event) => setNewItem({ ...newItem, colors: event.target.value })}
            />
            <input
              type="date"
              value={newItem.createdAt}
              onChange={(event) => setNewItem({ ...newItem, createdAt: event.target.value })}
            />
            <label className="admin-check">
              <input type="checkbox" checked={newItem.published} onChange={(event) => setNewItem({ ...newItem, published: event.target.checked })} />
              Publicada
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={newItem.featured} onChange={(event) => setNewItem({ ...newItem, featured: event.target.checked })} />
              Destacada
            </label>
            <button className="form-submit" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Anadir"}
            </button>
            {adminError || galleryError ? <p className="form-status form-status-error">{adminError || galleryError}</p> : null}
            {isGalleryLoading ? <p className="form-status">Cargando galeria...</p> : null}
          </form>

          <section className="admin-panel admin-groups-panel">
            <h2>Grupos</h2>
            <form className="admin-group-add" onSubmit={handleAddGroup}>
              <input placeholder="Nuevo grupo" value={newGroupLabel} onChange={(event) => setNewGroupLabel(event.target.value)} />
              <button type="submit">Anadir grupo</button>
            </form>
            <div className="admin-group-list">
              {groups.map((group) => (
                <article key={group.id} className="admin-group-row">
                  <input defaultValue={group.label} onBlur={(event) => void updateGroup(group.id, event.target.value)} />
                  <button type="button" onClick={() => void deleteGroup(group.id)} disabled={groups.length <= 1}>
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="admin-image-list">
            {items.map((item) => (
              <article className="admin-image-row" key={item.id}>
                <img src={item.thumbnailUrl} alt={item.alt} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.categoryLabel}</span>
                </div>
                <label>
                  Grupo
                  <select value={item.category} onChange={(event) => void updateItemGroup(item, event.target.value)}>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Etiquetas
                  <input defaultValue={item.etiquetas.join(", ")} onBlur={(event) => void updateEtiquetas(item, event.target.value)} />
                </label>
                <label>
                  Color
                  <input defaultValue={item.colors.join(", ")} onBlur={(event) => void updateColors(item, event.target.value)} />
                </label>
                <label>
                  Fecha
                  <input type="date" defaultValue={item.createdAt} onBlur={(event) => void updateItem(item.id, { createdAt: event.target.value })} />
                </label>
                <label className="admin-check">
                  <input type="checkbox" defaultChecked={item.published} onChange={(event) => void updateItem(item.id, { published: event.target.checked })} />
                  Publicada
                </label>
                <label className="admin-check">
                  <input type="checkbox" defaultChecked={item.featured} onChange={(event) => void updateItem(item.id, { featured: event.target.checked })} />
                  Destacada
                </label>
                <button type="button" onClick={() => void deleteItem(item.id)}>
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
