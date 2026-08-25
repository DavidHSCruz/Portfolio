export const MAX_MESSAGE_LENGTH = 600;

export type ChatInputResult =
  | { ok: true; message: string; turnstileToken: string }
  | { ok: false; message: string };

export function validateChatInput(input: unknown): ChatInputResult {
  if (!input || typeof input !== "object") return { ok: false, message: "Envie uma mensagem válida." };
  const { message, turnstileToken } = input as Record<string, unknown>;
  const normalized = typeof message === "string" ? message.trim() : "";
  if (!normalized || normalized.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, message: `A mensagem deve ter entre 1 e ${MAX_MESSAGE_LENGTH} caracteres.` };
  }
  return {
    ok: true,
    message: normalized,
    turnstileToken: typeof turnstileToken === "string" ? turnstileToken : "",
  };
}
