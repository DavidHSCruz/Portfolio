export const MAX_MESSAGE_LENGTH = 600;
export const MAX_HISTORY_MESSAGES = 6;
export const MAX_HISTORY_CONTENT_LENGTH = 1200;

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatInputResult =
  | { ok: true; message: string; turnstileToken: string; history: ChatHistoryMessage[] }
  | { ok: false; message: string };

function normalizeHistory(value: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-MAX_HISTORY_MESSAGES)
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const { role, content } = entry as Record<string, unknown>;
      const normalizedContent = typeof content === "string" ? content.trim() : "";
      if ((role !== "user" && role !== "assistant") || !normalizedContent || normalizedContent.length > MAX_HISTORY_CONTENT_LENGTH) {
        return [];
      }
      return [{ role, content: normalizedContent }];
    });
}

export function validateChatInput(input: unknown): ChatInputResult {
  if (!input || typeof input !== "object") return { ok: false, message: "Envie uma mensagem válida." };
  const { message, turnstileToken, history } = input as Record<string, unknown>;
  const normalized = typeof message === "string" ? message.trim() : "";
  if (!normalized || normalized.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, message: `A mensagem deve ter entre 1 e ${MAX_MESSAGE_LENGTH} caracteres.` };
  }
  return {
    ok: true,
    message: normalized,
    turnstileToken: typeof turnstileToken === "string" ? turnstileToken : "",
    history: normalizeHistory(history),
  };
}
