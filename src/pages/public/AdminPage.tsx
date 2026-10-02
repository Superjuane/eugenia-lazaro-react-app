import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { navigateTo } from "../../app/navigation";
import { useAdminAuth } from "../../features/admin/AdminAuthContext";
import { AdminImageEditor } from "../../features/admin/AdminImageEditor";
import { DeleteImageDialog } from "../../features/admin/DeleteImageDialog";
import { useGalleryData } from "../../features/gallery/GalleryDataContext";
import type { GalleryImageUpload, GalleryItem } from "../../shared/types/gallery";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSide = 2200;

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

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
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [newItem, setNewItem] = useState(() => ({
    title: "",
    category: "sillas",
    image: null as GalleryImageUpload | null,
    etiquetas: "",
    colors: "",
    createdAt: today(),
    published: false,
    featured: false,
  }));

  async function runAdminAction(action: () => Promise<void>) {
    setAdminError("");
    try {
      await action();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "No se pudieron guardar los cambios.");
    }
  }

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
      setIsPreparingImage(true);
      setAdminError("");
      const image = await optimizeImage(file);
      setNewItem((currentItem) => ({ ...currentItem, image }));
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "No se pudo preparar la imagen.");
    } finally {
      setIsPreparingImage(false);
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
        createdAt: today(),
        published: false,
        featured: false,
      });
      if (uploadInputRef.current) uploadInputRef.current.value = "";
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
      <div className="admin-shell">
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
            <h1>Galería e imágenes</h1>
          </header>

          {adminError || galleryError ? <p className="form-status form-status-error" role="alert">{adminError || galleryError}</p> : null}

          <form className="admin-panel admin-add-form" onSubmit={handleAddItem}>
            <h2>Añadir imagen</h2>
            <label className="admin-upload-field">
              Imagen
              <input ref={uploadInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleImageUpload(event)} required={!newItem.image} disabled={isSaving || isPreparingImage} />
            </label>
            <div className="admin-upload-preview-area">
              {newItem.image ? (
                <img className="admin-upload-preview" src={newItem.image.dataUrl} alt="Vista previa de la nueva imagen" />
              ) : <div className="admin-upload-placeholder">Vista previa de la imagen</div>}
            </div>
            <label>
              Título
              <input placeholder="Título de la imagen" value={newItem.title} onChange={(event) => setNewItem({ ...newItem, title: event.target.value })} required />
            </label>
            <div className="admin-field-pair">
              <label>
                Grupo
                <select value={groups.some((group) => group.id === newItem.category) ? newItem.category : groups[0]?.id ?? ""} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} required>
                  {groups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
                </select>
              </label>
              <label>
                Fecha
                <input type="date" value={newItem.createdAt} onChange={(event) => setNewItem({ ...newItem, createdAt: event.target.value })} required />
              </label>
            </div>
            <label>
              Etiquetas
              <input placeholder="Separadas por coma" value={newItem.etiquetas} onChange={(event) => setNewItem({ ...newItem, etiquetas: event.target.value })} />
            </label>
            <label>
              Colores
              <input placeholder="Separados por coma" value={newItem.colors} onChange={(event) => setNewItem({ ...newItem, colors: event.target.value })} />
            </label>
            <div className="admin-item-actions">
              <label className="admin-check">
                <input type="checkbox" checked={newItem.published} onChange={(event) => setNewItem({ ...newItem, published: event.target.checked })} />
                Publicada
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={newItem.featured} onChange={(event) => setNewItem({ ...newItem, featured: event.target.checked })} />
                Destacada
              </label>
            </div>
            <button className="form-submit" type="submit" disabled={isSaving || isPreparingImage}>
              {isSaving ? "Guardando…" : isPreparingImage ? "Preparando imagen…" : "Guardar y Subir"}
            </button>
            {isGalleryLoading ? <p className="form-status">Cargando galeria...</p> : null}
          </form>

          <section className="admin-panel admin-groups-panel">
            <h2>Grupos</h2>
            <form className="admin-group-add" onSubmit={handleAddGroup}>
              <input aria-label="Nombre del nuevo grupo" placeholder="Nuevo grupo" value={newGroupLabel} onChange={(event) => setNewGroupLabel(event.target.value)} required />
              <button type="submit">Añadir grupo</button>
            </form>
            <div className="admin-group-list">
              {groups.map((group) => {
                const imageCount = items.filter((item) => item.category === group.id).length;
                return (
                  <article key={group.id} className="admin-group-row">
                    <div className="admin-group-name">
                      <input aria-label={`Nombre del grupo ${group.label}`} defaultValue={group.label} onBlur={(event) => {
                        const label = event.target.value;
                        if (label !== group.label) void runAdminAction(() => updateGroup(group.id, label));
                      }} />
                      <small>{imageCount} {imageCount === 1 ? "imagen" : "imágenes"}</small>
                    </div>
                    <button type="button" onClick={() => void runAdminAction(() => deleteGroup(group.id))} disabled={imageCount > 0 || groups.length <= 1} title={imageCount > 0 ? "El grupo contiene imágenes" : groups.length <= 1 ? "Debe quedar al menos un grupo" : undefined}>
                      Eliminar
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="admin-image-list">
            {items.map((item) => (
              <AdminImageEditor key={item.id} item={item} groups={groups} onSave={updateItem} onDelete={setDeleteTarget} />
            ))}
          </div>
        </div>
      </div>
      {deleteTarget ? <DeleteImageDialog item={deleteTarget} onDelete={deleteItem} onClose={() => setDeleteTarget(null)} /> : null}
    </section>
  );
}
