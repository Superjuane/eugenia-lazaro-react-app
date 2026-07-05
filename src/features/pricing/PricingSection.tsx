import { SectionHeader } from "../../shared/ui/SectionHeader";
import { pricingItems } from "./pricing.data";

export function PricingSection() {
  return (
    <section className="page-section page-section-muted" id="pricing">
      <div className="section-container">
        <SectionHeader
          eyebrow="Precios"
          title="Referencias para encargos"
          description="Los importes finales dependeran del tamano, detalle y personalizacion."
        />

        <div className="pricing-grid">
          {pricingItems.map((item) => (
            <article className="pricing-card" key={item.title}>
              <h3>{item.title}</h3>
              <strong>{item.price}</strong>
              {item.note ? <p>{item.note}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
