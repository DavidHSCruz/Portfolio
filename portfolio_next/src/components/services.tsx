import { HiOutlineCodeBracket, HiOutlineCommandLine, HiOutlineDevicePhoneMobile, HiOutlineSparkles } from "react-icons/hi2";
import { SectionHeading } from "./section-heading";

const services = [
  { icon: HiOutlineSparkles, number: "01", title: "Interfaces e sites", text: "Experiências responsivas que unem identidade, acessibilidade e clareza para apresentar seu negócio." },
  { icon: HiOutlineCodeBracket, number: "02", title: "Aplicações web", text: "Produtos full stack com frontend consistente, regras de negócio e integrações pensadas em conjunto." },
  { icon: HiOutlineCommandLine, number: "03", title: "APIs e integrações", text: "Serviços em Node.js, dados e automações para conectar ferramentas e simplificar processos." },
  { icon: HiOutlineDevicePhoneMobile, number: "04", title: "Mobile e evolução", text: "Soluções React Native e melhoria contínua de produtos digitais que já estão em movimento." },
];

export function Services() {
  return <section id="servicos" className="container-shell py-24 md:py-36"><SectionHeading eyebrow="Como posso ajudar" title="Tecnologia com visão de produto, design e negócio." body="Do primeiro conceito à integração final, construo experiências digitais coerentes de ponta a ponta." /><div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 md:grid-cols-2">{services.map(({ icon: Icon, ...service }) => <article key={service.number} className="group bg-panel p-7 transition hover:bg-panel-soft md:p-10"><div className="flex items-center justify-between"><Icon className="text-mint" size={30} /><span className="font-mono text-xs text-muted">/{service.number}</span></div><h3 className="mt-16 text-2xl font-black tracking-tight md:text-3xl">{service.title}</h3><p className="mt-4 max-w-md leading-7 text-muted">{service.text}</p></article>)}</div></section>;
}
