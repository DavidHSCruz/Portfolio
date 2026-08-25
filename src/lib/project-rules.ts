import type { Project } from "@/types/project";

const EXCLUDED_PREFIXES = ["portfolio", "davidhscruz", "escala", "projetos"];

export function toSlug(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function isEligibleProject(project: Pick<Project, "name" | "tags">) {
  const name = project.name.toLowerCase();
  return project.tags.length > 0 && !EXCLUDED_PREFIXES.some((prefix) => name.startsWith(prefix));
}
