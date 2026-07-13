import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/types/project";

const project: Project = {
  id: 1, name: "Projeto secreto", slug: "projeto-secreto", description: "Uma solução completa.",
  tags: ["NEXT.JS", "TYPESCRIPT"], image: null, language: "TypeScript", url: null,
  private: true, homepage: null, updatedAt: "2026-01-10T00:00:00Z",
};

describe("ProjectCard", () => {
  it("leva ao case e informa quando o repositório é privado", () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByRole("link", { name: /projeto secreto/i }).getAttribute("href")).toBe("/projetos/projeto-secreto");
    expect(screen.getByText("Privado")).toBeTruthy();
    expect(screen.getByText("NEXT.JS")).toBeTruthy();
  });
});
