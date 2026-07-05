import { AboutSection } from "../../features/about/AboutSection";
import { ContactSection } from "../../features/contact/ContactSection";
import { FaqSection } from "../../features/faq/FaqSection";
import { GalleryPreviewSection } from "../../features/gallery/GalleryPreviewSection";
import { HeroSection } from "../../features/hero/HeroSection";
import { MapSection } from "../../features/map/MapSection";
import { PricingSection } from "../../features/pricing/PricingSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <GalleryPreviewSection />
      <PricingSection />
      <FaqSection />
      <MapSection />
      <ContactSection />
    </>
  );
}
