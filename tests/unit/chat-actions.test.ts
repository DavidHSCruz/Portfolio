import { describe, expect, it } from "vitest";
import { getContextualActionIds, parseChatModelResponse, resolveChatActions } from "@/lib/chat-actions";

describe("ações contextuais do chat", () => {
  it("oferece todos os canais para uma pergunta ampla de contato", () => {
    expect(getContextualActionIds("Como posso entrar em contato?", [])).toEqual([
      "whatsapp",
      "phone",
      "linkedin",
      "github",
    ]);
  });

  it("mantém somente ações conhecidas, sem duplicatas", () => {
    expect(getContextualActionIds("Quero conhecer seu trabalho", ["projects", "github", "github", "malicious"])).toEqual([
      "projects",
      "github",
    ]);
  });

  it("resolve os dados públicos sem aceitar links produzidos pela IA", () => {
    expect(resolveChatActions(["whatsapp", "phone"])).toEqual([
      expect.objectContaining({ id: "whatsapp", href: expect.stringContaining("https://wa.me/") }),
      expect.objectContaining({ id: "phone", label: expect.stringContaining("(41) 99949-7870"), href: "tel:+5541999497870" }),
    ]);
  });

  it("rejeita JSON incompleto sem expor o conteúdo bruto", () => {
    expect(parseChatModelResponse('{"content":', "Preciso de ajuda")).toBeNull();
  });
});
