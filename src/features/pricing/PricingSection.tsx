import { pricingItems } from "./pricing.data";
import type { PricingItem } from "./pricing.types";

function PricingIcon({ icon }: { icon: PricingItem["icon"] }) {
  if (icon === "signpost") {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M47 12h10v72H47z" />
        <path d="M18 24h54l10 10-10 10H18a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6Z" />
        <path d="M78 52H24L14 62l10 10h54a6 6 0 0 0 6-6v-8a6 6 0 0 0-6-6Z" />
      </svg>
    );
  }

  if (icon === "chair") {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M26 48h44a10 10 0 0 1 10 10v10H16V58a10 10 0 0 1 10-10Z" />
        <path d="M28 48V28a18 18 0 0 1 18-18h4a18 18 0 0 1 18 18v20h-9V28a9 9 0 0 0-9-9h-4a9 9 0 0 0-9 9v20Z" />
        <path d="M22 68h10v18H22zm42 0h10v18H64z" />
        <path d="M44 15h8v34h-8z" />
      </svg>
    );
  }

  if (icon === "table") {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M18 20h60a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Zm4 12v12h20V32Zm32 0v12h20V32ZM22 56v8h20v-8Zm32 0v8h20v-8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <path d="m48 8 12 26 28 3-21 19 6 28-25-14-25 14 6-28L8 37l28-3Z" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-container">
        <h2>Precios</h2>
        <div className="pricing-grid">
          {pricingItems.map((item) => (
            <article className="pricing-card" key={item.title}>
              <h3>{item.title}</h3>
              <PricingIcon icon={item.icon} />
              <div className="price-badge">{item.price}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
