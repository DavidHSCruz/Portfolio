import { MotionShell } from "@/components/motion-shell";
import type { Metadata } from "next";
import { ProjectsShowcase } from "@/components/projects-showcase";

export const metadata: Metadata = { title: "Projetos", description: "Aplicações, interfaces e integrações desenvolvidas por David Cruz.", alternates: { canonical: "/projetos" } };

export default function ProjectsPage() {
  return <MotionShell><main className="pt-24"><div data-motion-section className="container-shell pt-20"><span data-motion-eyebrow className="eyebrow">Portfólio</span><h1 data-motion-title className="display-title mt-5 max-w-5xl text-6xl md:text-9xl">Código é meio.<br /><span className="text-mint">Resultado é destino.</span></h1></div><ProjectsShowcase heading={false} /></main></MotionShell>;
}
