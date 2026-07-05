import { contactInfo, siteConfig } from "../../content/site";

export function SiteFooter() {
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
      <small>© {new Date().getFullYear()} {siteConfig.name}</small>
    </footer>
  );
}
