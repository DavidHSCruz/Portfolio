import { MotionShell } from "@/components/motion-shell";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft, HiArrowUpRight, HiLockClosed } from "react-icons/hi2";
import { ContactCta } from "@/components/contact-cta";
import { getProjectBySlug } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projeto não encontrado" };
  return { title: project.name, description: project.description, alternates: { canonical: `/projetos/${project.slug}` }, openGraph: { title: project.name, description: project.description, images: project.image ? [project.image] : [] } };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const updated = project.updatedAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(project.updatedAt)) : null;

  return <MotionShell><main className="pt-24"><article><header data-motion-section className="container-shell py-16 md:py-24"><Link href="/projetos" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-mint"><HiArrowLeft /> Todos os projetos</Link><div className="mt-14 grid gap-10 lg:grid-cols-[1fr_.45fr]"><div><div className="flex flex-wrap gap-2">{project.private && <span className="inline-flex items-center gap-1 rounded-full border border-cloud/15 px-3 py-1 text-xs font-bold text-muted"><HiLockClosed /> Repositório privado</span>}{project.tags.map((tag) => <span key={tag} className="rounded-full bg-mint px-3 py-1 text-xs font-black text-ink">{tag}</span>)}</div><h1 data-motion-title className="display-title mt-7 text-6xl md:text-9xl">{project.name}</h1><p data-motion-body className="mt-7 max-w-3xl text-xl leading-8 text-muted">{project.description}</p></div><div className="glass self-end rounded-2xl p-6 text-sm"><p className="text-muted">Tecnologia principal</p><p className="mt-1 text-lg font-black">{project.language || "Full stack"}</p>{updated && <><p className="mt-6 text-muted">Última atualização</p><p className="mt-1 font-bold">{updated}</p></>}<div className="mt-7 flex flex-col gap-3">{project.homepage && <a href={project.homepage} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-full bg-mint px-5 py-3 font-black text-ink">Abrir projeto <HiArrowUpRight /></a>}{project.url && <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-full border border-cloud/15 px-5 py-3 font-bold hover:border-mint">Ver código <HiArrowUpRight /></a>}</div></div></div></header><div className="container-shell"><div data-project-hero={project.slug} className="aspect-[16/9] rounded-3xl border border-cloud/10 bg-cover bg-center shadow-glow" role="img" aria-label={`Capa do projeto ${project.name}`} style={project.image ? { backgroundImage: `linear-gradient(to top, rgb(6 10 12 / .25), transparent), url("${encodeURI(project.image)}")` } : { background: "radial-gradient(circle at 60% 30%, #2c5d4c, #0d1518 65%)" }} /></div><section data-motion-section className="container-shell grid gap-10 py-24 md:grid-cols-3"><div data-motion-item><span className="eyebrow">Contexto</span><h2 className="mt-4 text-3xl font-black">O desafio</h2><p className="mt-4 leading-7 text-muted">Transformar requisitos e informações do projeto em uma experiência digital clara, consistente e utilizável.</p></div><div data-motion-item><span className="eyebrow">Construção</span><h2 className="mt-4 text-3xl font-black">A solução</h2><p className="mt-4 leading-7 text-muted">Arquitetura, interface e integrações trabalhadas como partes do mesmo produto, usando as tecnologias indicadas neste projeto.</p></div><div data-motion-item><span className="eyebrow">Contribuição</span><h2 className="mt-4 text-3xl font-black">Ponta a ponta</h2><p className="mt-4 leading-7 text-muted">Participação full stack com atenção à experiência, responsividade, manutenção e evolução da solução.</p></div></section></article><ContactCta /></main></MotionShell>;
}
