import { MotionShell } from "@/components/motion-shell";
import type { Metadata } from "next";
import { Avatar } from "@/components/avatar";
import { ContactCta } from "@/components/contact-cta";

export const metadata: Metadata = { title: "Sobre mim", description: "Conheça a trajetória multidisciplinar de David Cruz entre tecnologia, design e liderança.", alternates: { canonical: "/sobremim" } };

const journey = [
  ["Hoje", "Desenvolvimento full stack", "Interfaces, APIs e soluções digitais construídas com visão integrada de produto."],
  ["Criação", "Design e movimento", "Experiência com design gráfico e motion que fortalece o olhar para hierarquia, ritmo e interação."],
  ["Negócio", "Liderança e operação", "Vivência liderando equipes e acompanhando indicadores, atendimento e melhoria de processos."],
  ["Próximo", "Produtos com impacto", "O objetivo é juntar técnica, criatividade e contexto para entregar soluções que façam sentido."],
];

export default function AboutPage() {
  return <MotionShell><main className="pt-24"><section data-motion-section className="container-shell grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1fr_.7fr]"><div><span data-motion-eyebrow className="eyebrow">Sobre mim</span><h1 data-motion-title className="display-title mt-6 text-6xl md:text-9xl">Código, design e <span className="text-mint">visão humana.</span></h1><p data-motion-body className="mt-8 max-w-2xl text-lg leading-8 text-muted">Sou David Cruz, desenvolvedor full stack em formação contínua. Minha trajetória passa por liderança, atendimento, design e tecnologia — experiências que me ajudam a enxergar o produto além da tela.</p></div><Avatar /></section><section data-motion-section className="border-y border-cloud/8 bg-panel/40 py-24"><div className="container-shell"><span data-motion-eyebrow className="eyebrow">Trajetória</span><div className="mt-12 divide-y divide-white/10">{journey.map(([year, title, text]) => <article key={year} data-motion-item className="grid gap-4 py-9 md:grid-cols-[.3fr_.7fr_1fr] md:items-start"><span className="font-mono text-mint">{year}</span><h2 className="text-2xl font-black">{title}</h2><p className="leading-7 text-muted">{text}</p></article>)}</div></div></section><ContactCta /></main></MotionShell>;
}
