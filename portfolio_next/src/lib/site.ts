export const site = {
  name: "David Cruz",
  title: "David Cruz — Desenvolvedor Full Stack",
  description:
    "Desenvolvimento full stack para transformar ideias em experiências digitais rápidas, acessíveis e memoráveis.",
  email: "david.hs.cruz@gmail.com",
  phone: "5541999497870",
  phoneLabel: "(41) 99949-7870",
  linkedin: "https://www.linkedin.com/in/david-hs-cruz",
  github: "https://github.com/davidHSCruz",
  whatsappMessage:
    "Olá, David! Conheci seu trabalho pelo portfólio e gostaria de conversar sobre um projeto.",
};

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export function getWhatsAppUrl(message = site.whatsappMessage) {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(message)}`;
}
