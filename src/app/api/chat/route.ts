import { GoogleGenAI, Type } from "@google/genai";
import { chatActionIds, parseChatModelResponse, resolveChatActions, type ChatAction } from "@/lib/chat-actions";
import { CHAT_AI_LIMIT_MESSAGE, CHAT_PERSONA_INSTRUCTION } from "@/lib/chat-copy";
import { commercialContext } from "@/lib/curriculum";
import { getProjects } from "@/lib/projects";
import { verifyTurnstile } from "@/lib/turnstile";
import { validateChatInput } from "@/lib/chat-validation";

export const runtime = "nodejs";
export const maxDuration = 30;

function errorResponse(code: string, message: string, status: number, actions?: ChatAction[]) {
  const payload = {
    error: { code, message },
    ...(actions?.length ? { actions } : {}),
  };
  return Response.json(payload, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Não foi possível ler a mensagem.", 400);
  }

  const input = validateChatInput(body);
  if (!input.ok) return errorResponse("INVALID_INPUT", input.message, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const isHuman = await verifyTurnstile(
    input.turnstileToken,
    ip,
  );
  if (!isHuman) {
    return errorResponse("BOT_CHECK_FAILED", "Confirme que você é uma pessoa e tente novamente.", 403);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse("SERVICE_UNAVAILABLE", "O assistente está temporariamente indisponível.", 503);
  }

  const projects = await getProjects();
  const projectsContext = projects
    .slice(0, 20)
    .map((project) => `- ${project.name}: ${project.description} (${project.tags.join(", ")})`)
    .join("\n");

  const systemInstruction = `
${CHAT_PERSONA_INSTRUCTION}
Quando houver intenção de contratação, sugira contato por WhatsApp ou email.
Além do texto, escolha apenas ações realmente úteis para a intenção atual. Use "whatsapp",
"phone", "linkedin" e "github" para contato; "email" para proposta; "projects" para conhecer
trabalhos; e "services" para conhecer serviços. Evite ações sem relação com a pergunta.

${commercialContext}

Projetos selecionados:
${projectsContext || "Nenhum projeto disponível no momento."}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...input.history.map(({ role, content }) => ({
          role: role === "assistant" ? "model" : "user",
          parts: [{ text: content }],
        })),
        { role: "user", parts: [{ text: input.message }] },
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "Resposta natural e acolhedora em português do Brasil, com emojis usados com moderação." },
            actions: {
              type: Type.ARRAY,
              description: "IDs de ações úteis para a intenção atual. Use uma lista vazia quando nenhuma ação ajudar.",
              maxItems: "4",
              items: { type: Type.STRING, format: "enum", enum: [...chatActionIds] },
            },
          },
          required: ["content", "actions"],
        },
      },
    });
    return Response.json(parseChatModelResponse(response.text, input.message));
  } catch (error) {
    console.error("Falha na chamada ao Gemini", error);
    return errorResponse(
      "AI_LIMIT",
      CHAT_AI_LIMIT_MESSAGE,
      429,
      resolveChatActions(["whatsapp", "email"]),
    );
  }
}
