import { describe, expect, it } from "vitest";
import { CHAT_AI_LIMIT_MESSAGE, CHAT_INITIAL_MESSAGE, CHAT_PERSONA_INSTRUCTION } from "@/lib/chat-copy";

describe("personalidade do secretário virtual", () => {
  it("se apresenta como secretário virtual do David", () => {
    expect(CHAT_INITIAL_MESSAGE).toMatch(/secretário virtual do David/i);
    expect(CHAT_INITIAL_MESSAGE).toContain("👋");
    expect(CHAT_PERSONA_INSTRUCTION).toMatch(/secretário virtual do David/i);
    expect(CHAT_PERSONA_INSTRUCTION).toMatch(/emojis com moderação/i);
  });

  it("trata o limite como um intervalo temporário", () => {
    expect(CHAT_AI_LIMIT_MESSAGE).toMatch(/horário de intervalo/i);
    expect(CHAT_AI_LIMIT_MESSAGE).toMatch(/conversar mais tarde/i);
    expect(CHAT_AI_LIMIT_MESSAGE).toContain("☕");
  });
});
