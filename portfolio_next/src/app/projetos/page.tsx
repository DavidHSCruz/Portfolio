import type { Metadata } from "next";
import { ProjectsShowcase } from "@/components/projects-showcase";

export const metadata: Metadata = { title: "Projetos", description: "Aplicações, interfaces e integrações desenvolvidas por David Cruz.", alternates: { canonical: "/projetos" } };

export default function ProjectsPage() {
  return <main className="pt-24"><div className="container-shell pt-20"><span className="eyebrow">Portfólio</span><h1 className="display-title mt-5 max-w-5xl text-6xl md:text-9xl">Código é meio.<br /><span className="text-mint">Resultado é destino.</span></h1></div><ProjectsShowcase heading={false} /></main>;
}
