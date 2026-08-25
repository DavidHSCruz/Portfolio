import { describe, expect, it } from "vitest";
import { getWhatsAppUrl } from "@/lib/site";

describe("links de contato", () => {
  it("codifica a mensagem do WhatsApp sem perder caracteres", () => {
    const url = getWhatsAppUrl("Olá, vamos conversar?");
    expect(url).toContain("https://wa.me/5541999497870");
    expect(decodeURIComponent(url)).toContain("Olá, vamos conversar?");
  });
});
