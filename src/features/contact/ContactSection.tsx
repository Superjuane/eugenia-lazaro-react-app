import { contactInfo } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { ContactForm } from "./ContactForm";

export function ContactSection() {
  return (
    <section className="page-section contact-section" id="contact">
      <div className="section-container">
        <SectionHeader
          eyebrow="Contacto"
          title="Escríbenos"
          description="El email es el canal principal de contacto. El destino real queda configurable para el futuro panel."
        />

        <div className="contact-layout">
          <div className="contact-card">
            <span className="contact-label">Email</span>
            <a href={`mailto:${contactInfo.receiverEmail}`}>{contactInfo.publicEmailLabel}</a>
            <span className="contact-label">WhatsApp</span>
            <a href={`tel:${contactInfo.phoneHref}`}>{contactInfo.phoneLabel}</a>
            <span className="contact-label">Ubicación</span>
            <span>{contactInfo.location}</span>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
