"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { HiArrowUp, HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; theme: string; size: string }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

type Message = { role: "assistant" | "user"; content: string };

const initialMessage: Message = { role: "assistant", content: "Olá! Posso explicar como o David trabalha, apresentar projetos ou ajudar a transformar sua ideia em um próximo passo." };

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(process.env.NODE_ENV === "development" ? "dev-token" : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  function renderChallenge() {
    if (!siteKey || !challengeRef.current || !window.turnstile || widgetRef.current) return;
    widgetRef.current = window.turnstile.render(challengeRef.current, {
      sitekey: siteKey,
      callback: setToken,
      "expired-callback": () => setToken(""),
      theme: "dark",
      size: "flexible",
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = value.trim();
    if (!message || loading) return;
    if (!token) {
      setMessages((items) => [...items, { role: "assistant", content: "Conclua a verificação de segurança antes de enviar." }]);
      return;
    }
    setValue("");
    setLoading(true);
    setMessages((items) => [...items, { role: "user", content: message }]);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, turnstileToken: token }) });
      const data = (await response.json()) as { content?: string; error?: { message?: string } };
      const content = response.ok ? data.content : data.error?.message;
      setMessages((items) => [...items, { role: "assistant", content: content || "Não consegui responder agora. Você também pode usar os contatos da página." }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", content: "A conexão falhou. Tente novamente ou fale diretamente pelo WhatsApp." }]);
    } finally {
      setLoading(false);
      if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
      if (siteKey) setToken("");
    }
  }

  return <>
    {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderChallenge} />}
    <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 hidden size-15 place-items-center rounded-full border border-mint/30 bg-panel text-mint shadow-glow transition hover:scale-105 hover:bg-mint hover:text-ink md:grid" aria-label="Abrir assistente comercial"><HiChatBubbleLeftRight size={26} /></button>
    {open && <div className="fixed inset-0 z-[60] flex items-end justify-end bg-ink/60 p-0 backdrop-blur-sm md:p-6" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label="Assistente comercial" className="flex h-[min(760px,92dvh)] w-full flex-col overflow-hidden rounded-t-3xl border border-cloud/10 bg-panel shadow-2xl md:w-[420px] md:rounded-3xl">
        <header className="flex items-center justify-between border-b border-cloud/8 p-5"><div><p className="font-black">Assistente do David</p><p className="mt-1 flex items-center gap-2 text-xs text-muted"><span className="size-2 rounded-full bg-mint" /> online para orientar</p></div><button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-cloud/10 hover:text-mint" aria-label="Fechar assistente"><HiXMark size={22} /></button></header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">{messages.map((message, index) => <div key={index} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-mint font-semibold text-ink" : "border border-cloud/8 bg-ink text-cloud"}`}><ReactMarkdown>{message.content}</ReactMarkdown></div>)}{loading && <div className="w-fit rounded-2xl bg-ink px-4 py-3 text-sm text-muted">Pensando<span className="animate-pulse">…</span></div>}</div>
        <form onSubmit={submit} className="border-t border-cloud/8 p-4"><div ref={challengeRef} className="mb-3 empty:hidden" /><div className="flex items-center gap-2 rounded-full border border-cloud/12 bg-ink p-1.5 pl-4 focus-within:border-mint"><label htmlFor="chat-message" className="sr-only">Mensagem</label><input id="chat-message" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} maxLength={600} placeholder="Conte um pouco sobre sua ideia…" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted" /><button type="submit" disabled={loading || !value.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-ink disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensagem"><HiArrowUp /></button></div><p className="mt-2 px-2 text-[10px] text-muted">A IA pode cometer erros. Não envie dados sensíveis.</p></form>
      </section>
    </div>}
  </>;
}
