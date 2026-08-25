import { describe, expect, it } from "vitest";
import {
  getProjectCacheVariant,
  shouldUseProjectCache,
} from "@/lib/project-cache";

describe("cache de projetos", () => {
  it("ignora o cache persistente durante o desenvolvimento", () => {
    expect(shouldUseProjectCache("development")).toBe(false);
  });

  it("mantem a revalidacao periodica em producao", () => {
    expect(shouldUseProjectCache("production")).toBe(true);
  });

  it("muda a chave quando o token e regenerado sem expor o segredo", () => {
    const token = "github_pat_token-antigo";
    const current = getProjectCacheVariant(token);
    const regenerated = getProjectCacheVariant("github_pat_token-novo");

    expect(current).toMatch(/^token-[a-f0-9]{16}$/);
    expect(current).not.toContain(token);
    expect(regenerated).not.toBe(current);
  });

  it("separa o cache anonimo do cache autenticado", () => {
    expect(getProjectCacheVariant(undefined)).toBe("anonymous");
    expect(getProjectCacheVariant("   ")).toBe("anonymous");
  });
});
