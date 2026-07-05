import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { isInternalClick, navigateTo } from "../../app/navigation";
import sunLogo from "../../assets/sol-2.png";
import { mainNavigation, siteConfig } from "../../content/site";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(() => window.location.pathname.toLowerCase() === "/gallery");

  useEffect(() => {
    const updateHeaderState = () => {
      const isGalleryPage = window.location.pathname.toLowerCase() === "/gallery";
      const hero = document.querySelector<HTMLElement>(".hero-section");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight - 72 : 0;

      setIsSolid(isGalleryPage || window.scrollY >= heroBottom);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);
    window.addEventListener("popstate", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
      window.removeEventListener("popstate", updateHeaderState);
    };
  }, []);

  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isInternalClick(event)) {
      return;
    }

    event.preventDefault();
    setIsOpen(false);
    navigateTo(href);
  }

  return (
    <header className={isSolid ? "site-header is-solid" : "site-header"}>
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

      <nav className={isOpen ? "site-nav is-open" : "site-nav"} aria-label="Navegación principal">
        {mainNavigation.map((item) => (
          <a key={item.href} href={item.href} onClick={(event) => handleLinkClick(event, item.href)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
