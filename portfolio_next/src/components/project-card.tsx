import Link from "next/link";
import { HiArrowUpRight, HiLockClosed } from "react-icons/hi2";
import type { Project } from "@/types/project";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return <Link href={`/projetos/${project.slug}`} aria-label={`Ver detalhes de ${project.name}`} className={`group relative flex min-h-[430px] overflow-hidden rounded-3xl border border-cloud/10 bg-panel ${priority ? "md:col-span-2 md:min-h-[520px]" : ""}`}>
    <div role="img" aria-label={`Capa do projeto ${project.name}`} className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={project.image ? { backgroundImage: `linear-gradient(to top, #080d0f 3%, transparent 75%), url("${encodeURI(project.image)}")` } : { background: "radial-gradient(circle at 70% 20%, #274c40, #0d1518 60%)" }} />
    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
    <div className="relative mt-auto w-full p-6 md:p-8">
      <div className="mb-4 flex flex-wrap gap-2">{project.private && <span className="inline-flex items-center gap-1 rounded-full border border-cloud/15 bg-ink/70 px-3 py-1 text-xs font-bold text-muted"><HiLockClosed /> Privado</span>}{project.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-mint px-3 py-1 text-xs font-black text-ink">{tag}</span>)}</div>
      <div className="flex items-end justify-between gap-4"><div><h3 className="text-2xl font-black tracking-tight md:text-4xl">{project.name}</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">{project.description}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-full border border-cloud/15 transition group-hover:rotate-45 group-hover:bg-mint group-hover:text-ink"><HiArrowUpRight size={22} /></span></div>
    </div>
  </Link>;
}
