import { describe, expect, it } from "vitest";
import { validateChatInput } from "@/lib/chat-validation";

describe("validação do chat", () => {
  it("normaliza uma mensagem válida", () => {
    expect(validateChatInput({ message: "  Quero criar um site  ", turnstileToken: "token" })).toEqual({
      ok: true,
      message: "Quero criar um site",
      turnstileToken: "token",
      history: [],
    });
  });

  it("normaliza e limita o histórico às seis mensagens mais recentes", () => {
    const history = Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: ` mensagem ${index} `,
    }));
    const result = validateChatInput({ message: "Continue", turnstileToken: "token", history });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.history).toHaveLength(6);
      expect(result.history[0]).toEqual({ role: "user", content: "mensagem 2" });
      expect(result.history[5]).toEqual({ role: "assistant", content: "mensagem 7" });
    }
  });

  it.each([null, {}, { message: "" }, { message: " ".repeat(10) }, { message: "a".repeat(601) }])(
    "rejeita entrada inválida %#",
    (input) => expect(validateChatInput(input).ok).toBe(false),
  );
});
