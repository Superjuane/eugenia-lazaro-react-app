import type { ReactNode } from "react";
import { SiteHeader } from "../features/site-navigation/SiteHeader";
import { SiteFooter } from "../features/site-navigation/SiteFooter";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
