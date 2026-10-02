import { contactInfo } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function ContactSection() {
  return (
    <section className="page-section contact-section" id="contact">
      <div className="section-container">
        <SectionHeader
          eyebrow="Contacto"
          title="Escríbenos"
          description="Cuéntanos tu idea por WhatsApp y te ayudaremos a preparar una pieza personalizada."
        />

        <div className="contact-layout">
          <div className="contact-card">
            <span className="contact-label">WhatsApp</span>
            <a className="contact-whatsapp" href={contactInfo.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span>Escribir por WhatsApp</span>
              <small>{contactInfo.phoneLabel}</small>
            </a>
            <span className="contact-label">Ubicación</span>
            <span>{contactInfo.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
