import { describe, expect, it, vi } from "vitest";
import { generateChatReply } from "@/lib/chat-generation";

describe("geração resiliente do chat", () => {
  it("tenta novamente quando o Gemini corta o JSON", async () => {
    const generate = vi.fn()
      .mockResolvedValueOnce({ text: '{"content":', candidates: [{ finishReason: "MAX_TOKENS" }] })
      .mockResolvedValueOnce({ text: '{"content":"Claro! ✨","actions":["services"]}', candidates: [{ finishReason: "STOP" }] });

    const reply = await generateChatReply(generate, "Preciso de uma automação");

    expect(generate).toHaveBeenCalledTimes(2);
    expect(reply).toEqual({
      content: "Claro! ✨",
      actions: [expect.objectContaining({ id: "services" })],
    });
  });

  it("usa uma mensagem natural quando as duas tentativas falham", async () => {
    const generate = vi.fn().mockResolvedValue({
      text: '{"content":',
      candidates: [{ finishReason: "MAX_TOKENS" }],
    });

    const reply = await generateChatReply(generate, "Preciso de uma automação");

    expect(generate).toHaveBeenCalledTimes(2);
    expect(reply.content).toMatch(/pequena falha/i);
    expect(reply.content).not.toContain('{"content"');
  });
});
