import type { NavigationItem } from "../shared/types/navigation";

export const siteConfig = {
  name: "Eugenia Pintura",
  subtitle: "Eugenia Lazaro Pintura Decorativa",
  description: "Portfolio de pintura decorativa y trabajos artesanales personalizados.",
};

export const contactInfo = {
  publicEmailLabel: "eugenialazaro.com",
  receiverEmail: "juaneolivan@gmail.com",
  phoneLabel: "+34 608 180 159",
  phoneHref: "+34608180159",
  location: "Mora d'Ebre, Tarragona",
  formEndpoint: "/api/contact",
};

export const mainNavigation: NavigationItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Galeria", href: "/Gallery" },
  { label: "Navidad", href: "/navidad" },
  { label: "Proceso", href: "/proceso" },
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
    question: "Los precios son fijos?",
    answer: "Los precios publicados son fijos para las piezas de referencia. Si cambia el tamano o el detalle, se revisara antes de confirmar.",
  },
  {
    question: "Puedo enviar una idea o una imagen de referencia?",
    answer: "Si. Puedes escribir por email con la idea, el nombre, colores o cualquier referencia que ayude a preparar la pieza.",
  },
  {
    question: "Donde se realiza el trabajo?",
    answer: "El trabajo se realiza desde Mora d'Ebre, Tarragona. Los detalles de entrega se acuerdan en cada caso.",
  },
];

export const mapConfig = {
  title: "Mora d'Ebre, Tarragona",
  embedUrl: "https://www.google.com/maps?q=M%C3%B3ra%20d'Ebre%2C%20Tarragona&output=embed",
};

export const simplePages = {
  privacy: {
    eyebrow: "Legal",
    title: "Politica de privacidad",
    body: "Pagina informativa pendiente de contenido legal definitivo. Aqui se describira el tratamiento de datos de contacto y comunicaciones.",
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookies",
    body: "Pagina informativa pendiente de contenido definitivo. Aqui se explicara el uso de cookies tecnicas, analiticas o de terceros si se incorporan.",
  },
  navidad: {
    eyebrow: "Temporada",
    title: "Navidad",
    body: "Pagina mockup para una futura coleccion navidena con piezas destacadas, filtros y textos de campana.",
  },
  proceso: {
    eyebrow: "Proceso",
    title: "Proceso de fabricacion",
    body: "Pagina mockup para explicar de forma visual los pasos de preparacion, pintura, acabado y entrega.",
  },
};
