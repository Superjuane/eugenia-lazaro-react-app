import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import { contactInfo, siteConfig } from "../../content/site";

export function SiteFooter() {
  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    navigateTo(href);
  }

  return (
    <footer className="site-footer">
      <div>
        <strong>{siteConfig.name}</strong>
        <span>{siteConfig.subtitle}</span>
      </div>
      <div>
        <span>{contactInfo.publicEmailLabel}</span>
        <span>{contactInfo.location}</span>
      </div>
      <div>
        <a href="/politica-privacidad" onClick={(event) => handleLinkClick(event, "/politica-privacidad")}>
          Politica de privacidad
        </a>
        <a href="/cookies" onClick={(event) => handleLinkClick(event, "/cookies")}>
          Cookies
        </a>
      </div>
      <small>© {new Date().getFullYear()} {siteConfig.name}</small>
    </footer>
  );
}
