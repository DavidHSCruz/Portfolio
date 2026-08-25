import { describe, expect, it } from "vitest";
import { getProjectImage } from "@/lib/project-images";

describe("imagens dos projetos", () => {
  it("usa o asset local existente do IgrejaFire", () => {
    expect(getProjectImage("IgrejaFire", true, "DavidHSCruz")).toBe(
      "/imagens/Projetos/Igreja_FIRE_WEB.png",
    );
  });

  it("mantem a imagem remota para repositorios publicos", () => {
    expect(getProjectImage("CasaVerde", false, "DavidHSCruz")).toContain(
      "raw.githubusercontent.com/DavidHSCruz/CasaVerde",
    );
  });
});
