import { getWhatsAppUrl, site } from "@/lib/site";

export const chatActionIds = [
  "whatsapp",
  "phone",
  "linkedin",
  "github",
  "email",
  "projects",
  "services",
] as const;

export type ChatActionId = (typeof chatActionIds)[number];

export type ChatAction = {
  id: ChatActionId;
  label: string;
  href: string;
  external: boolean;
};

const actionCatalog: Record<ChatActionId, ChatAction> = {
  whatsapp: {
    id: "whatsapp",
    label: "Conversar no WhatsApp",
    href: getWhatsAppUrl(),
    external: true,
  },
  phone: {
    id: "phone",
    label: `Telefone: ${site.phoneLabel}`,
    href: `tel:+${site.phone}`,
    external: false,
  },
  linkedin: {
    id: "linkedin",
    label: "Ver LinkedIn",
    href: site.linkedin,
    external: true,
  },
  github: {
    id: "github",
    label: "Ver GitHub",
    href: site.github,
    external: true,
  },
  email: {
    id: "email",
    label: "Enviar email",
    href: `mailto:${site.email}`,
    external: false,
  },
  projects: {
    id: "projects",
    label: "Ver projetos",
    href: "/projetos",
    external: false,
  },
  services: {
    id: "services",
    label: "Conhecer serviços",
    href: "/#servicos",
    external: false,
  },
};

const actionIdSet = new Set<string>(chatActionIds);
const broadContactPattern = /(como|onde|quais?|formas?).{0,24}(contato|contactar|falar|conversar)|entrar em contato|falar com (o )?david/;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sanitizeActionIds(ids: unknown): ChatActionId[] {
  if (!Array.isArray(ids)) return [];

  return [...new Set(ids.filter((id): id is ChatActionId => typeof id === "string" && actionIdSet.has(id)))].slice(0, 4);
}

export function getContextualActionIds(message: string, suggestedIds: unknown): ChatActionId[] {
  const normalizedMessage = normalize(message);
  if (broadContactPattern.test(normalizedMessage)) {
    return ["whatsapp", "phone", "linkedin", "github"];
  }

  const directContactIds: ChatActionId[] = [];
  if (/whats(app)?/.test(normalizedMessage)) directContactIds.push("whatsapp");
  if (/telefone|telefonar|ligar|numero/.test(normalizedMessage)) directContactIds.push("phone");
  if (/linkedin/.test(normalizedMessage)) directContactIds.push("linkedin");
  if (/github/.test(normalizedMessage)) directContactIds.push("github");
  if (/e-?mail/.test(normalizedMessage)) directContactIds.push("email");

  return sanitizeActionIds([...directContactIds, ...sanitizeActionIds(suggestedIds)]);
}

export function resolveChatActions(ids: unknown): ChatAction[] {
  return sanitizeActionIds(ids).map((id) => actionCatalog[id]);
}

export function parseChatModelResponse(rawResponse: string | undefined, message: string) {
  if (!rawResponse?.trim()) return null;

  try {
    const parsed = JSON.parse(rawResponse) as { content?: unknown; actions?: unknown };
    if (typeof parsed.content !== "string" || !parsed.content.trim()) return null;

    const actionIds = getContextualActionIds(message, parsed.actions);
    return { content: parsed.content.trim(), actions: resolveChatActions(actionIds) };
  } catch {
    return null;
  }
}
