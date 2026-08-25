"use client";

import Script from "next/script";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { HiArrowTopRightOnSquare, HiArrowUp, HiBriefcase, HiChatBubbleLeftRight, HiCodeBracket, HiEnvelope, HiPhone, HiXMark } from "react-icons/hi2";
import type { ChatAction } from "@/lib/chat-actions";
import { CHAT_INITIAL_MESSAGE } from "@/lib/chat-copy";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void; theme: string; size: string; execution: "execute"; appearance: "interaction-only" }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string) => void;
    };
  }
}

type Message = { role: "assistant" | "user"; content: string; actions?: ChatAction[] };

const initialMessage: Message = { role: "assistant", content: CHAT_INITIAL_MESSAGE };

const actionIcons: Record<ChatAction["id"], IconType> = {
  whatsapp: FaWhatsapp,
  phone: HiPhone,
  linkedin: FaLinkedin,
  github: FaGithub,
  email: HiEnvelope,
  projects: HiCodeBracket,
  services: HiBriefcase,
};

function MessageActions({ actions }: { actions?: ChatAction[] }) {
  if (!actions?.length) return null;

  return <div className="mt-3 grid gap-2">
    {actions.map((action) => {
      const Icon = actionIcons[action.id];
      return <a
        key={action.id}
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noreferrer" : undefined}
        className="group flex min-h-11 items-center gap-3 rounded-xl border border-mint/20 bg-mint/8 px-3 py-2 font-bold text-cloud transition hover:border-mint/50 hover:bg-mint hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
      >
        <Icon className="shrink-0 text-mint transition group-hover:text-ink" aria-hidden="true" />
        <span className="min-w-0 flex-1">{action.label}</span>
        {action.external && <HiArrowTopRightOnSquare className="shrink-0 opacity-60" aria-hidden="true" />}
      </a>;
    })}
  </div>;
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(process.env.NODE_ENV === "development" ? "dev-token" : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderChallenge = useCallback(() => {
    if (!siteKey || !challengeRef.current || !window.turnstile || widgetRef.current) return;
    widgetRef.current = window.turnstile.render(challengeRef.current, {
      sitekey: siteKey,
      execution: "execute",
      appearance: "interaction-only",
      callback: setToken,
      "expired-callback": () => setToken(""),
      theme: "dark",
      "error-callback": () => {
        pendingMessageRef.current = null;
        setLoading(false);
        setMessages((current) => [...current, { role: "assistant", content: "Não foi possível concluir a verificação de segurança. Tente novamente." }]);
      },
      size: "flexible",
    });
  }, [siteKey]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  useEffect(() => {
    if (!open || !siteKey) return;

    const frame = window.requestAnimationFrame(renderChallenge);

    return () => {
      window.cancelAnimationFrame(frame);
      const widgetId = widgetRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      widgetRef.current = null;
    };
  }, [open, renderChallenge, siteKey]);

  const sendMessage = useCallback(async (message: string, verifiedToken: string) => {
    setValue("");
    setLoading(true);
    setMessages((items) => [...items, { role: "user", content: message }]);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, turnstileToken: verifiedToken }) });
      const data = (await response.json()) as { content?: string; actions?: ChatAction[]; error?: { message?: string } };
      const content = response.ok ? data.content : data.error?.message;
      setMessages((items) => [...items, {
        role: "assistant",
        content: content || "Não consegui responder agora. Você também pode usar os contatos da página.",
        actions: data.actions,
      }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", content: "A conexão falhou por aqui 😕. Tente novamente ou fale diretamente com o David pelo WhatsApp." }]);
    } finally {
      setLoading(false);
      if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
      setToken(process.env.NODE_ENV === "development" ? "dev-token" : "");
    }
  }, []);

  useEffect(() => {
    if (!token || !pendingMessageRef.current) return;
    const message = pendingMessageRef.current;
    pendingMessageRef.current = null;
    void sendMessage(message, token);
  }, [sendMessage, token]);

  function openChat() {
    setToken(process.env.NODE_ENV === "development" ? "dev-token" : "");
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const message = value.trim();
    if (!message || loading) return;
    if (!token) {
      const widgetId = widgetRef.current;
      if (!widgetId || !window.turnstile) {
        setMessages((items) => [...items, { role: "assistant", content: "A verificação de segurança ainda está carregando. Tente novamente." }]);
        return;
      }

      pendingMessageRef.current = message;
      setLoading(true);
      try {
        window.turnstile.execute(widgetId);
      } catch {
        pendingMessageRef.current = null;
        setLoading(false);
        setMessages((items) => [...items, { role: "assistant", content: "Não foi possível iniciar a verificação de segurança. Tente novamente." }]);
      }
      return;
    }

    void sendMessage(message, token);
  }

  return <>
    {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderChallenge} />}
    <button onClick={openChat} className="fixed bottom-6 right-6 z-40 hidden size-15 place-items-center rounded-full border border-mint/30 bg-panel text-mint shadow-glow transition hover:scale-105 hover:bg-mint hover:text-ink md:grid" aria-label="Abrir assistente comercial"><HiChatBubbleLeftRight size={26} /></button>
    {open && <div className="fixed inset-0 z-[60] flex items-end justify-end bg-ink/60 p-0 backdrop-blur-sm md:p-6" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label="Assistente comercial" className="flex h-[min(760px,92dvh)] w-full flex-col overflow-hidden rounded-t-3xl border border-cloud/10 bg-panel shadow-2xl md:w-[420px] md:rounded-3xl">
        <header className="flex items-center justify-between border-b border-cloud/8 p-5"><div><p className="font-black">Secretário virtual do David</p><p className="mt-1 flex items-center gap-2 text-xs text-muted"><span className="size-2 rounded-full bg-mint" /> por aqui para ajudar</p></div><button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-cloud/10 hover:text-mint" aria-label="Fechar assistente"><HiXMark size={22} /></button></header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((message, index) => <div
            key={index}
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-mint font-semibold text-ink" : "border border-cloud/8 bg-ink text-cloud"}`}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.role === "assistant" && <MessageActions actions={message.actions} />}
          </div>)}
          {loading && <div className="w-fit rounded-2xl bg-ink px-4 py-3 text-sm text-muted">Só um instante<span className="animate-pulse">…</span></div>}
        </div>
        <form onSubmit={submit} className="border-t border-cloud/8 p-4"><div ref={challengeRef} className="mb-3 empty:hidden" /><div className="flex items-center gap-2 rounded-full border border-cloud/12 bg-ink p-1.5 pl-4 focus-within:border-mint"><label htmlFor="chat-message" className="sr-only">Mensagem</label><input id="chat-message" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} maxLength={600} placeholder="Conte um pouco sobre sua ideia…" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted" /><button type="submit" disabled={loading || !value.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-ink disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensagem"><HiArrowUp /></button></div><p className="mt-2 px-2 text-[10px] text-muted">A IA pode cometer erros. Não envie dados sensíveis.</p></form>
      </section>
    </div>}
  </>;
}
