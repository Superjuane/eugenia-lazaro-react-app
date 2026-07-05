import { siteConfig } from "../../content/site";
import heroImage from "../../assets/background-clouds-1.jpg";
import { isInternalClick, navigateTo } from "../../app/navigation";
import type { MouseEvent } from "react";

export function HeroSection() {
  function handleGalleryClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    navigateTo("/Gallery");
  }

  return (
    <section className="hero-section" id="home" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="section-container hero-content">
        <p className="eyebrow">{siteConfig.subtitle}</p>
        <h1>{siteConfig.name}</h1>
        <a className="primary-action" href="/Gallery" onClick={handleGalleryClick}>
          Ver galería
        </a>
      </div>
    </section>
  );
}
