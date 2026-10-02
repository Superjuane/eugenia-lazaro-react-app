import { useState } from "react";
import type { FormEvent } from "react";
import type { GalleryGroup, GalleryItem } from "../../shared/types/gallery";

type AdminImageEditorProps = {
  item: GalleryItem;
  groups: GalleryGroup[];
  onSave: (id: string, update: Partial<GalleryItem>) => Promise<void>;
  onDelete: (item: GalleryItem) => void;
};

function editableFields(item: GalleryItem) {
  return {
    title: item.title,
    category: item.category,
    createdAt: item.createdAt,
    etiquetas: item.etiquetas.join(", "),
    colors: item.colors.join(", "),
    published: item.published,
    featured: item.featured,
  };
}

type ImageDraft = ReturnType<typeof editableFields>;

function toList(value: string) {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

export function AdminImageEditor({ item, groups, onSave, onDelete }: AdminImageEditorProps) {
  const [draft, setDraft] = useState<ImageDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fields = draft ?? editableFields(item);
  const hasChanges = JSON.stringify(fields) !== JSON.stringify(editableFields(item));

  function edit(update: Partial<ImageDraft>) {
    setDraft((current) => ({ ...(current ?? editableFields(item)), ...update }));
    setError("");
  }

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasChanges || isSaving) return;

    const title = fields.title.trim();
    const group = groups.find((candidate) => candidate.id === fields.category);
    if (!title || !group) {
      setError("Indica un título y un grupo válidos.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onSave(item.id, {
        title,
        category: group.id,
        categoryLabel: group.label,
        createdAt: fields.createdAt,
        etiquetas: toList(fields.etiquetas),
        colors: toList(fields.colors),
        published: fields.published,
        featured: fields.featured,
        ...(title !== item.title || group.id !== item.category ? { alt: `${title} - ${group.label}` } : {}),
      });
      setDraft(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-image-row" onSubmit={saveChanges} aria-label={`Editar ${item.title}`}>
      <img src={item.thumbnailUrl} alt={item.alt} loading="lazy" />
      <fieldset className="admin-image-fields" disabled={isSaving}>
        <label>
          Título
          <input value={fields.title} onChange={(event) => edit({ title: event.target.value })} required />
        </label>
        <div className="admin-field-pair">
          <label>
            Grupo
            <select value={fields.category} onChange={(event) => edit({ category: event.target.value })} required>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" value={fields.createdAt} onChange={(event) => edit({ createdAt: event.target.value })} required />
          </label>
        </div>
        <label>
          Etiquetas
          <input value={fields.etiquetas} onChange={(event) => edit({ etiquetas: event.target.value })} />
        </label>
        <label>
          Colores
          <input value={fields.colors} onChange={(event) => edit({ colors: event.target.value })} />
        </label>
        <div className="admin-item-actions">
          <label className="admin-check">
            <input type="checkbox" checked={fields.published} onChange={(event) => edit({ published: event.target.checked })} />
            Publicada
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={fields.featured} onChange={(event) => edit({ featured: event.target.checked })} />
            Destacada
          </label>
          <div className="admin-item-buttons">
            {hasChanges ? (
              <button className="admin-save-changes" type="submit" disabled={isSaving}>
                {isSaving ? "Guardando…" : "Guardar y subir cambios"}
              </button>
            ) : null}
            <button className="admin-delete-button" type="button" onClick={() => onDelete(item)}>Eliminar</button>
          </div>
        </div>
        {error ? <p className="form-status form-status-error" role="alert">{error}</p> : null}
      </fieldset>
    </form>
  );
}
