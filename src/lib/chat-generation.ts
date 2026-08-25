import { getContextualActionIds, parseChatModelResponse, resolveChatActions } from "@/lib/chat-actions";
import { CHAT_RESPONSE_FALLBACK_MESSAGE } from "@/lib/chat-copy";

type ModelGenerationResponse = {
  text?: string;
  candidates?: Array<{ finishReason?: string }>;
};

type InvalidGeneration = {
  attempt: number;
  finishReason?: string;
};

export async function generateChatReply(
  generate: () => Promise<ModelGenerationResponse>,
  message: string,
  onInvalid?: (details: InvalidGeneration) => void,
) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await generate();
    const finishReason = response.candidates?.[0]?.finishReason;
    const parsed = parseChatModelResponse(response.text, message);

    if (parsed && finishReason !== "MAX_TOKENS") {
      return parsed;
    }

    onInvalid?.({ attempt, finishReason });
  }

  const actionIds = getContextualActionIds(message, []);
  return {
    content: CHAT_RESPONSE_FALLBACK_MESSAGE,
    actions: resolveChatActions(actionIds),
  };
}
