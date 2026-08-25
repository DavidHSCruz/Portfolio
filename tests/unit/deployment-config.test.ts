import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("configuracao de deploy", () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8"),
  ) as {
    engines?: { node?: string };
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it("usa a versao atual do Node suportada pela Vercel", () => {
    expect(packageJson.engines?.node).toBe("24.x");
  });

  it("nao fixa binarios nativos exclusivos do Windows", () => {
    expect(packageJson.dependencies).not.toHaveProperty(
      "lightningcss-win32-x64-msvc",
    );
    expect(packageJson.devDependencies).not.toHaveProperty(
      "lightningcss-win32-x64-msvc",
    );
  });
});
