import { describe, expect, it } from "vitest";
import { isEligibleProject, toSlug } from "@/lib/project-rules";

describe("regras de publicação dos projetos", () => {
  it("gera slugs estáveis e sem acentos", () => {
    expect(toSlug("Aplicação Gestão & Vendas")).toBe("aplicacao-gestao-vendas");
  });

  it("publica repositórios com tópicos preenchidos", () => {
    expect(isEligibleProject({ name: "crm-clientes", tags: ["NEXT.JS"] })).toBe(true);
  });

  it.each(["portfolio-novo", "DavidHSCruz", "escala-app", "projetos-legado"])(
    "exclui o prefixo reservado %s",
    (name) => expect(isEligibleProject({ name, tags: ["REACT"] })).toBe(false),
  );

  it("não publica repositório sem tópicos", () => {
    expect(isEligibleProject({ name: "rascunho", tags: [] })).toBe(false);
  });
});
