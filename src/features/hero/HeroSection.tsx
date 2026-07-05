import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import heroImage from "../../assets/background-clouds-1.jpg";
import { siteConfig } from "../../content/site";

export function HeroSection() {
  function handleFeaturedClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    navigateTo("/#gallery");
  }

  return (
    <section className="hero-section" id="home" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="section-container hero-content">
        <p className="eyebrow">{siteConfig.subtitle}</p>
        <h1>{siteConfig.name}</h1>
        <a className="primary-action" href="/#gallery" onClick={handleFeaturedClick}>
          Ver trabajos destacados
        </a>
      </div>
    </section>
  );
}
