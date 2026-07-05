import type { NavigationItem } from "../shared/types/navigation";

export const siteConfig = {
  name: "Eugenia Pintura",
  subtitle: "Eugenia Lázaro Pintura Decorativa",
  description: "Portfolio de pintura decorativa y trabajos artesanales personalizados.",
};

export const contactInfo = {
  publicEmailLabel: "eugenialazaro.com",
  receiverEmail: "juaneolivan@gmail.com",
  phoneLabel: "+34 608 180 159",
  phoneHref: "+34608180159",
  location: "Móra d'Ebre, Tarragona",
  formEndpoint: "/api/contact",
};

export const mainNavigation: NavigationItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Galería", href: "/Gallery" },
  { label: "Precios", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contacto", href: "/#contact" },
];

export const aboutContent = {
  eyebrow: "Sobre Eugenia",
  title: "Pintura decorativa con un aire infantil y hecho a mano",
  body:
    "Piezas pintadas con un estilo dulce, luminoso y personalizado para habitaciones infantiles, regalos y detalles especiales.",
};

export const faqItems = [
  {
    question: "¿Los precios son fijos?",
    answer: "Los precios publicados son fijos para las piezas de referencia. Si cambia el tamaño o el detalle, se revisará antes de confirmar.",
  },
  {
    question: "¿Puedo enviar una idea o una imagen de referencia?",
    answer: "Sí. Puedes escribir por email con la idea, el nombre, colores o cualquier referencia que ayude a preparar la pieza.",
  },
  {
    question: "¿Dónde se realiza el trabajo?",
    answer: "El trabajo se realiza desde Móra d'Ebre, Tarragona. Los detalles de entrega se acuerdan en cada caso.",
  },
];

export const mapConfig = {
  title: "Móra d'Ebre, Tarragona",
  embedUrl: "https://www.google.com/maps?q=M%C3%B3ra%20d'Ebre%2C%20Tarragona&output=embed",
};
