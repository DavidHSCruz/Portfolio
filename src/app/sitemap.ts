import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes = ["", "/projetos", "/sobremim", "/contato"].map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route ? .8 : 1 }));
  const projects = await getProjects();
  return [...staticRoutes, ...projects.map((project) => ({ url: `${base}/projetos/${project.slug}`, lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(), changeFrequency: "weekly" as const, priority: .7 }))];
}
