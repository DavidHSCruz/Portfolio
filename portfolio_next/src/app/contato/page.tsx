import type { Metadata } from "next";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { getWhatsAppUrl, site } from "@/lib/site";

export const metadata: Metadata = { title: "Contato", description: "Converse com David Cruz sobre seu próximo site, aplicativo ou integração.", alternates: { canonical: "/contato" } };

const channels = [
  { label: "WhatsApp", value: site.phoneLabel, href: getWhatsAppUrl(), icon: FaWhatsapp },
  { label: "Email", value: site.email, href: `mailto:${site.email}`, icon: HiOutlineEnvelope },
  { label: "LinkedIn", value: "david-hs-cruz", href: site.linkedin, icon: FaLinkedin },
  { label: "GitHub", value: "davidHSCruz", href: site.github, icon: FaGithub },
];

export default function ContactPage() {
  return <main className="container-shell min-h-screen pt-24"><section className="py-16 md:py-24"><span className="eyebrow">Contato</span><h1 className="display-title mt-6 max-w-5xl text-6xl md:text-9xl">Seu próximo projeto pode <span className="text-mint">começar aqui.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted">Conte o que você quer construir, melhorar ou conectar. Respondo pelos canais abaixo e podemos entender juntos o melhor próximo passo.</p><div className="mt-14 grid gap-4 md:grid-cols-2">{channels.map(({ icon: Icon, ...channel }) => <a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="glass group flex min-h-36 items-center justify-between rounded-3xl p-6 transition hover:-translate-y-1 hover:border-mint/40"><div><p className="text-sm font-bold text-muted">{channel.label}</p><p className="mt-2 break-all text-lg font-black md:text-2xl">{channel.value}</p></div><span className="grid size-12 place-items-center rounded-full border border-cloud/10 text-mint transition group-hover:bg-mint group-hover:text-ink"><Icon size={23} /></span></a>)}</div></section></main>;
}
