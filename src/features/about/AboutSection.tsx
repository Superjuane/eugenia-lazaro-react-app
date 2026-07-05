import { aboutContent } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function AboutSection() {
  return (
    <section className="page-section about-section" id="about">
      <div className="section-container split-section">
        <SectionHeader eyebrow={aboutContent.eyebrow} title={aboutContent.title} description={aboutContent.body} align="left" />
        <div className="about-note">
          <strong>Estilo dulce, luminoso y personal.</strong>
          <p>La web queda preparada para editar textos, precios, imágenes destacadas y categorías desde el futuro panel de administración.</p>
        </div>
      </div>
    </section>
  );
}
