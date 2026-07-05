import { useState } from "react";
import type { GalleryGroup } from "../../shared/types/gallery";
import type { GalleryFilter, GallerySort } from "./gallery.utils";

type GalleryFiltersProps = {
  categories: GalleryGroup[];
  etiquetas: string[];
  colors: string[];
  activeFilter: GalleryFilter;
  selectedEtiquetas: string[];
  selectedColors: string[];
  sort: GallerySort;
  onCategoryChange: (filter: GalleryFilter) => void;
  onEtiquetasChange: (etiquetas: string[]) => void;
  onColorsChange: (colors: string[]) => void;
  onSortChange: (sort: GallerySort) => void;
};

type MultiPicklistProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

function MultiPicklist({ label, options, selected, onChange }: MultiPicklistProps) {
  const [search, setSearch] = useState("");
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()));

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((selectedOption) => selectedOption !== option));
      return;
    }

    onChange([...selected, option]);
  }

  return (
    <div className="multi-filter">
      <div className="multi-filter-heading">
        <span>{label}</span>
        {selected.length ? (
          <button type="button" onClick={() => onChange([])}>
            Limpiar
          </button>
        ) : null}
      </div>
      <input
        aria-label={`Buscar ${label}`}
        placeholder="Buscar"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="multi-filter-options">
        {filteredOptions.map((option) => (
          <label key={option}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} />
            {option}
          </label>
        ))}
        {!filteredOptions.length ? <span className="multi-filter-empty">Sin resultados</span> : null}
      </div>
    </div>
  );
}

export function GalleryFilters({
  categories,
  etiquetas,
  colors,
  activeFilter,
  selectedEtiquetas,
  selectedColors,
  sort,
  onCategoryChange,
  onEtiquetasChange,
  onColorsChange,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="gallery-control-panel" aria-label="Filtros de galeria">
      <div className="gallery-filters">
        <button className={activeFilter === "all" ? "is-active" : ""} type="button" onClick={() => onCategoryChange("all")}>
          Todos
        </button>
        {categories.map((category) => (
          <button
            className={activeFilter === category.id ? "is-active" : ""}
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="gallery-select-row">
        <MultiPicklist label="Etiquetas" options={etiquetas} selected={selectedEtiquetas} onChange={onEtiquetasChange} />
        <MultiPicklist label="Color" options={colors} selected={selectedColors} onChange={onColorsChange} />
        <label>
          Orden
          <select value={sort} onChange={(event) => onSortChange(event.target.value as GallerySort)}>
            <option value="newest">Mas recientes</option>
            <option value="oldest">Mas antiguas</option>
            <option value="featured">Destacadas primero</option>
            <option value="manual">Orden manual</option>
          </select>
        </label>
      </div>
    </div>
  );
}
