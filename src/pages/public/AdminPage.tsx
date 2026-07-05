import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { navigateTo } from "../../app/navigation";
import { useAdminAuth } from "../../features/admin/AdminAuthContext";
import { useGalleryData } from "../../features/gallery/GalleryDataContext";
import type { GalleryItem } from "../../shared/types/gallery";

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminPage() {
  const { session, isLoading, login, logout } = useAdminAuth();
  const { items, groups, addItem, updateItem, deleteItem, addGroup, updateGroup, deleteGroup, resetItems } = useGalleryData();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [newItem, setNewItem] = useState({
    title: "",
    category: "sillas",
    imageDataUrl: "",
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
    }
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setNewItem({ ...newItem, imageDataUrl: "" });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setNewItem((currentItem) => ({ ...currentItem, imageDataUrl: String(reader.result ?? "") }));
    };

    reader.readAsDataURL(file);
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedGroup = groups.find((group) => group.id === newItem.category) ?? groups[0];

    if (!newItem.imageDataUrl || !selectedGroup) {
      return;
    }

    addItem({
      title: newItem.title,
      category: selectedGroup.id,
      categoryLabel: selectedGroup.label,
      etiquetas: toList(newItem.etiquetas),
      colors: toList(newItem.colors),
      thumbnailUrl: newItem.imageDataUrl,
      fullUrl: newItem.imageDataUrl,
      alt: `${newItem.title} - ${selectedGroup.label}`,
      featured: newItem.featured,
      published: newItem.published,
      createdAt: newItem.createdAt || undefined,
    });

    setNewItem({
      title: "",
      category: groups[0]?.id ?? "",
      imageDataUrl: "",
      etiquetas: "",
      colors: "",
      createdAt: "",
      published: false,
      featured: false,
    });
  }

  function handleAddGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addGroup(newGroupLabel);
    setNewGroupLabel("");
  }

  function updateItemGroup(item: GalleryItem, groupId: string) {
    const selectedGroup = groups.find((group) => group.id === groupId);

    if (!selectedGroup) {
      return;
    }

    updateItem(item.id, {
      category: selectedGroup.id,
      categoryLabel: selectedGroup.label,
      alt: `${item.title} - ${selectedGroup.label}`,
    });
  }

  function updateEtiquetas(item: GalleryItem, value: string) {
    updateItem(item.id, { etiquetas: toList(value) });
  }

  function updateColors(item: GalleryItem, value: string) {
    updateItem(item.id, { colors: toList(value) });
  }

  if (isLoading) {
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
          <button type="button" onClick={resetItems}>
            Restaurar datos
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
              <input type="file" accept="image/*" onChange={handleImageUpload} required={!newItem.imageDataUrl} />
            </label>
            {newItem.imageDataUrl ? <img className="admin-upload-preview" src={newItem.imageDataUrl} alt="Vista previa" /> : null}
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
            <button className="form-submit" type="submit">
              Anadir
            </button>
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
                  <input value={group.label} onChange={(event) => updateGroup(group.id, event.target.value)} />
                  <button type="button" onClick={() => deleteGroup(group.id)} disabled={groups.length <= 1}>
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
                  <select value={item.category} onChange={(event) => updateItemGroup(item, event.target.value)}>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Etiquetas
                  <input value={item.etiquetas.join(", ")} onChange={(event) => updateEtiquetas(item, event.target.value)} />
                </label>
                <label>
                  Color
                  <input value={item.colors.join(", ")} onChange={(event) => updateColors(item, event.target.value)} />
                </label>
                <label>
                  Fecha
                  <input type="date" value={item.createdAt} onChange={(event) => updateItem(item.id, { createdAt: event.target.value })} />
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={item.published} onChange={(event) => updateItem(item.id, { published: event.target.checked })} />
                  Publicada
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={item.featured} onChange={(event) => updateItem(item.id, { featured: event.target.checked })} />
                  Destacada
                </label>
                <button type="button" onClick={() => deleteItem(item.id)}>
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
