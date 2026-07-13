import { describe, expect, it } from "vitest";
import { validateChatInput } from "@/lib/chat-validation";

describe("validação do chat", () => {
  it("normaliza uma mensagem válida", () => {
    expect(validateChatInput({ message: "  Quero criar um site  ", turnstileToken: "token" })).toEqual({
      ok: true,
      message: "Quero criar um site",
      turnstileToken: "token",
    });
  });

  it.each([null, {}, { message: "" }, { message: " ".repeat(10) }, { message: "a".repeat(601) }])(
    "rejeita entrada inválida %#",
    (input) => expect(validateChatInput(input).ok).toBe(false),
  );
});
