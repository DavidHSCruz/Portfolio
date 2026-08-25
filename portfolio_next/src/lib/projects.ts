import "server-only";

import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";
import { unstable_cache } from "next/cache";
import type { Project } from "@/types/project";
import { isEligibleProject, toSlug } from "@/lib/project-rules";
import { listOwnerRepositories, type RepositoryClient } from "@/lib/github-repositories";
import { shouldUseProjectCache } from "@/lib/project-cache";
import { getProjectImage } from "@/lib/project-images";

type GitHubRepository = RestEndpointMethodTypes["repos"]["listForAuthenticatedUser"]["response"]["data"][number];

async function fetchProjects(): Promise<Project[]> {
  const username = process.env.GITHUB_USERNAME || "davidHSCruz";
  const token = process.env.GITHUB_TOKEN?.trim();
  const octokit = new Octokit({ auth: token || undefined });
  const publicOctokit = token ? new Octokit() : octokit;

  const repos = await listOwnerRepositories<GitHubRepository>(
    octokit as unknown as RepositoryClient<GitHubRepository>,
    username,
    Boolean(token),
    publicOctokit as unknown as RepositoryClient<GitHubRepository>,
  );

  return repos
    .map((repo): Project => ({
      id: repo.id,
      name: repo.name,
      slug: toSlug(repo.name),
      description: repo.description || "Projeto em evolução. Confira os detalhes e tecnologias utilizadas.",
      tags: repo.topics?.map((tag) => tag.toUpperCase()) ?? [],
      image: getProjectImage(repo.name, repo.private, username),
      language: repo.language ?? null,
      url: repo.private ? null : repo.html_url,
      private: repo.private,
      homepage: repo.homepage || null,
      updatedAt: repo.updated_at ?? null,
    }))
    .filter(isEligibleProject);
}

const getCachedProjects = unstable_cache(fetchProjects, ["eligible-github-projects"], {
  revalidate: 3600,
  tags: ["github-projects"],
});

export async function getProjects() {
  try {
    return shouldUseProjectCache(process.env.NODE_ENV)
      ? await getCachedProjects()
      : await fetchProjects();
  } catch (error) {
    console.error("Falha ao carregar projetos do GitHub", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}
