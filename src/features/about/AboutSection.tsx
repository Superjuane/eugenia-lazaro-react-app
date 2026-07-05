import logoIcon from "../../assets/sol-2.png";
import { aboutContent } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function AboutSection() {
  return (
    <section className="page-section about-section" id="about">
      <div className="section-container split-section">
        <SectionHeader eyebrow={aboutContent.eyebrow} title={aboutContent.title} description={aboutContent.body} align="left" />
        <div className="about-logo-panel" aria-hidden="true">
          <img src={logoIcon} alt="" />
        </div>
      </div>
    </section>
  );
}
