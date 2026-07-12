import { useEffect, useState } from "react";
import { AdminAuthProvider } from "../features/admin/AdminAuthContext";
import { GalleryDataProvider } from "../features/gallery/GalleryDataContext";
import { PublicLayout } from "../layouts/PublicLayout";
import { GalleryPage } from "../pages/public/GalleryPage";
import { HomePage } from "../pages/public/HomePage";
import { AdminPage } from "../pages/public/AdminPage";
import { SimplePage } from "../pages/public/SimplePage";

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  const normalizedPath = pathname.toLowerCase();
  const contentPage = normalizedPath === "/gallery" ? (
    <GalleryPage />
  ) : normalizedPath === "/admin" ? (
    <AdminPage />
  ) : normalizedPath === "/politica-privacidad" ? (
    <SimplePage pageKey="privacy" />
  ) : normalizedPath === "/cookies" ? (
    <SimplePage pageKey="cookies" />
  ) : normalizedPath === "/navidad" ? (
    <SimplePage pageKey="navidad" />
  ) : normalizedPath === "/proceso" ? (
    <SimplePage pageKey="proceso" />
  ) : (
    <HomePage />
  );

  return (
    <AdminAuthProvider>
      <GalleryDataProvider>
        <PublicLayout>{contentPage}</PublicLayout>
      </GalleryDataProvider>
    </AdminAuthProvider>
  );
}
