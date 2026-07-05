import { useState } from "react";
import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import { mainNavigation, siteConfig } from "../../content/site";
import sunLogo from "../../assets/sol-2.png";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    setIsOpen(false);
    navigateTo(href);
  }

  return (
    <header className="site-header">
      <a className="brand-link" href="/" aria-label="Ir al inicio" onClick={(event) => handleLinkClick(event, "/")}>
        <img src={sunLogo} alt="" aria-hidden="true" />
        <span>{siteConfig.name}</span>
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={isOpen ? "site-nav is-open" : "site-nav"} aria-label="Navegacion principal">
        {mainNavigation.map((item) => (
          <a key={item.href} href={item.href} onClick={(event) => handleLinkClick(event, item.href)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
