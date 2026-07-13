import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpertiseFocus } from "@/components/expertise-focus";

describe("ExpertiseFocus", () => {
  it("mantém uma única explicação curta visível", () => {
    render(<ExpertiseFocus />);
    fireEvent.focus(screen.getByRole("button", { name: "Backend" }));

    expect(screen.getByText("APIs e integrações que fazem o produto funcionar.")).toBeTruthy();
    expect(screen.queryByText("Interfaces vivas, claras e responsivas.")).toBeNull();
  });
});
