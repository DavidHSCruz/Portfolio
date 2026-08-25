import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatAssistant } from "@/components/chat-assistant";

vi.mock("next/script", () => ({ default: () => null }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  delete window.turnstile;
});

describe("ChatAssistant", () => {
  it("abre, recebe foco e fecha com Escape", () => {
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /abrir assistente/i }));
    expect(screen.getByRole("dialog", { name: /assistente comercial/i })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("executa o Turnstile discretamente somente ao enviar", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    const renderChallenge = vi.fn().mockReturnValue("widget-id");
    const remove = vi.fn();
    const execute = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: "Você pode falar diretamente com o David.",
        actions: [
          { id: "whatsapp", label: "Conversar no WhatsApp", href: "https://wa.me/5541999497870", external: true },
          { id: "phone", label: "Telefone: (41) 99949-7870", href: "tel:+5541999497870", external: false },
          { id: "linkedin", label: "Ver LinkedIn", href: "https://linkedin.com/in/david-hs-cruz", external: true },
          { id: "github", label: "Ver GitHub", href: "https://github.com/davidHSCruz", external: true },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    window.turnstile = {
      render: renderChallenge,
      reset: vi.fn(),
      remove,
      execute,
    };

    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /abrir assistente/i }));
    await waitFor(() => expect(renderChallenge).toHaveBeenCalled());
    expect(renderChallenge.mock.calls[0]?.[1]).toMatchObject({
      sitekey: "test-site-key",
      execution: "execute",
      appearance: "interaction-only",
    });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Olá" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    expect(execute).toHaveBeenCalledWith("widget-id");
    expect(screen.queryByText(/conclua a verificação/i)).toBeNull();
    renderChallenge.mock.calls[0]?.[1].callback("verified-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      message: "Olá",
      turnstileToken: "verified-token",
      history: [],
    });
    expect(await screen.findByText("Você pode falar diretamente com o David.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /conversar no whatsapp/i }).getAttribute("href")).toBe("https://wa.me/5541999497870");
    expect(screen.getByRole("link", { name: /telefone: \(41\) 99949-7870/i }).getAttribute("href")).toBe("tel:+5541999497870");
    expect(screen.getByRole("link", { name: /ver linkedin/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /ver github/i })).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "E como ele trabalha?" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
    renderChallenge.mock.calls[0]?.[1].callback("second-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const secondRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(JSON.parse(secondRequest.body as string).history).toEqual([
      { role: "user", content: "Olá" },
      { role: "assistant", content: "Você pode falar diretamente com o David." },
    ]);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(remove).toHaveBeenCalledWith("widget-id");
  });

  it("mantém um contato disponível durante o intervalo", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    const renderChallenge = vi.fn().mockReturnValue("widget-id");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { code: "AI_LIMIT", message: "Estou no meu horário de intervalo neste momento ☕, mas podemos conversar mais tarde." },
        actions: [
          { id: "whatsapp", label: "Conversar no WhatsApp", href: "https://wa.me/5541999497870", external: true },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    window.turnstile = {
      render: renderChallenge,
      reset: vi.fn(),
      remove: vi.fn(),
      execute: vi.fn(),
    };

    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /abrir assistente/i }));
    await waitFor(() => expect(renderChallenge).toHaveBeenCalled());
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Podemos conversar?" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    renderChallenge.mock.calls[0]?.[1].callback("verified-token");

    expect(await screen.findByText(/horário de intervalo neste momento/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /conversar no whatsapp/i })).toBeTruthy();
  });
});
