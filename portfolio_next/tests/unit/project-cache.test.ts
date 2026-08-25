import { describe, expect, it } from "vitest";
import { shouldUseProjectCache } from "@/lib/project-cache";

describe("cache de projetos", () => {
  it("ignora o cache persistente durante o desenvolvimento", () => {
    expect(shouldUseProjectCache("development")).toBe(false);
  });

  it("mantem a revalidacao periodica em producao", () => {
    expect(shouldUseProjectCache("production")).toBe(true);
  });
});
