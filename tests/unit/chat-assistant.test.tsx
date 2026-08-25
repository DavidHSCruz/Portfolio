import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatAssistant } from "@/components/chat-assistant";

vi.mock("next/script", () => ({ default: () => null }));

describe("ChatAssistant", () => {
  it("abre, recebe foco e fecha com Escape", () => {
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /abrir assistente/i }));
    expect(screen.getByRole("dialog", { name: /assistente comercial/i })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
