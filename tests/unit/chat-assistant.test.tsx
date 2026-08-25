import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatAssistant } from "@/components/chat-assistant";

vi.mock("next/script", () => ({ default: () => null }));

afterEach(() => {
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

  it("renderiza o Turnstile quando o chat e aberto", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    const renderChallenge = vi.fn().mockReturnValue("widget-id");
    const remove = vi.fn();
    window.turnstile = {
      render: renderChallenge,
      reset: vi.fn(),
      remove,
    };

    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /abrir assistente/i }));
    await waitFor(() => expect(renderChallenge).toHaveBeenCalled());
    expect(renderChallenge.mock.calls[0]?.[1]).toMatchObject({ sitekey: "test-site-key" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(remove).toHaveBeenCalledWith("widget-id");
  });
});
