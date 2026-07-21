import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteThemeProvider, useSiteTheme } from "@/components/site-theme";

function ThemeHarness() {
  const { activateDarkTheme, activateLightTheme, theme } = useSiteTheme();

  return <button onClick={theme === "dark" ? activateLightTheme : activateDarkTheme}>{theme}</button>;
}

describe("SiteThemeProvider", () => {
  afterEach(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.remove("theme-transitioning");
  });

  it("comeca escuro e mantem o claro apenas enquanto o provider esta montado", async () => {
    const view = render(
      <SiteThemeProvider>
        <ThemeHarness />
      </SiteThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "dark" })).not.toBeNull();
    expect(document.querySelector("[data-theme-transition-layer]")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "dark" }));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
    expect(screen.getByRole("button", { name: "light" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "light" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));

    view.unmount();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
