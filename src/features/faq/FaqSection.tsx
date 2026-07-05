import { faqItems } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function FaqSection() {
  return (
    <section className="page-section page-section-muted" id="faq">
      <div className="section-container">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes" />
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
