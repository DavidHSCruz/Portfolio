import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl, site } from "@/lib/site";

export function ContactCta() {
  return <section className="container-shell py-24 md:py-36"><div className="relative overflow-hidden rounded-[2rem] border border-mint/20 bg-mint p-8 text-ink shadow-glow md:p-16"><div className="absolute -right-24 -top-24 size-80 rounded-full border-[50px] border-ink/5" /><span className="text-xs font-black uppercase tracking-[.2em]">Tem uma ideia em mente?</span><h2 className="display-title relative mt-6 max-w-4xl text-5xl md:text-8xl">Vamos transformar conversa em produto.</h2><div className="relative mt-10 flex flex-wrap gap-4"><a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center gap-2 rounded-full bg-ink px-6 font-extrabold text-cloud transition hover:-translate-y-1"><FaWhatsapp /> Chamar no WhatsApp</a><a href={`mailto:${site.email}`} className="inline-flex min-h-13 items-center rounded-full border-2 border-ink/20 px-6 font-extrabold transition hover:border-ink">Enviar email</a></div></div></section>;
}
