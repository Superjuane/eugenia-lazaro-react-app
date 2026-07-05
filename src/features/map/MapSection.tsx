import { mapConfig } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function MapSection() {
  return (
    <section className="page-section map-section" id="map">
      <div className="section-container">
        <SectionHeader eyebrow="Ubicación" title={mapConfig.title} />
        <iframe
          className="map-frame"
          src={mapConfig.embedUrl}
          title={`Mapa de ${mapConfig.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
