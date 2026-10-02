import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "../../shared/types/gallery";

type DeleteImageDialogProps = {
  item: GalleryItem;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
};

export function DeleteImageDialog({ item, onDelete, onClose }: DeleteImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function confirmDelete() {
    setIsDeleting(true);
    setError("");
    try {
      await onDelete(item.id);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo eliminar la imagen.");
      setIsDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="admin-delete-dialog"
      aria-labelledby="delete-image-title"
      aria-describedby="delete-image-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!isDeleting) onClose();
      }}
    >
      <h2 id="delete-image-title">¿Eliminar esta imagen?</h2>
      <p id="delete-image-description">Se eliminará «{item.title}» de la galería. Esta acción no se puede deshacer.</p>
      {error ? <p className="form-status form-status-error" role="alert">{error}</p> : null}
      <div className="admin-delete-dialog-actions">
        <button className="admin-delete-confirm" type="button" disabled={isDeleting} onClick={() => void confirmDelete()}>
          {isDeleting ? "Eliminando…" : "Sí, quiero eliminar esta imagen"}
        </button>
        <button className="admin-delete-cancel" type="button" disabled={isDeleting} onClick={onClose} autoFocus>Volver</button>
      </div>
    </dialog>
  );
}
