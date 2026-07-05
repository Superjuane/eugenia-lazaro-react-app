import { useEffect, useState } from "react";
import { PublicLayout } from "../layouts/PublicLayout";
import { GalleryPage } from "../pages/public/GalleryPage";
import { HomePage } from "../pages/public/HomePage";

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  const normalizedPath = pathname.toLowerCase();

  return (
    <PublicLayout>
      {normalizedPath === "/gallery" ? <GalleryPage /> : <HomePage />}
    </PublicLayout>
  );
}
