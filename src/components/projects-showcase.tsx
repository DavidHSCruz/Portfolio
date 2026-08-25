import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { ProjectCard } from "./project-card";
import { SectionHeading } from "./section-heading";

export async function ProjectsShowcase({ limit, heading = true }: { limit?: number; heading?: boolean }) {
  const projects = await getProjects();
  const visible = limit ? projects.slice(0, limit) : projects;
  return <section data-motion-section className="container-shell py-24 md:py-36">
    {heading && <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><SectionHeading eyebrow="Trabalho selecionado" title="Projetos que saíram da ideia." body="A vitrine é atualizada a partir dos projetos que recebem informações completas no GitHub." />{limit && <Link href="/projetos" data-motion-body className="shrink-0 font-bold text-mint hover:underline">Ver todos os projetos →</Link>}</div>}
    {visible.length > 0 ? <div className="mt-14 grid gap-5 md:grid-cols-2">{visible.map((project, index) => <ProjectCard key={project.id} project={project} priority={index === 0 && visible.length > 2} />)}</div> : <div className="glass mt-14 rounded-3xl p-10"><h3 className="text-2xl font-black">A vitrine está sendo atualizada.</h3><p className="mt-3 text-muted">Os projetos voltarão assim que a conexão com o GitHub for restabelecida.</p></div>}
  </section>;
}
