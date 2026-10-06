import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A Cloudflare lê os cabeçalhos de segurança de public/_headers.
const root = new URL("../../", import.meta.url);

function cloudflareHeaders(): Record<string, string> {
  const text = readFileSync(new URL("public/_headers", root), "utf8");
  const headers: Record<string, string> = {};
  let inBlock = false;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!line.startsWith(" ")) {
      inBlock = line.trim() === "/*";
      continue;
    }
    if (inBlock) {
      const [name, ...rest] = line.trim().split(":");
      headers[name] = rest.join(":").trim();
    }
  }
  return headers;
}

describe("security headers", () => {
  it("keep a strict CSP", () => {
    const csp = cloudflareHeaders()["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("connect-src 'self' https://anlniqjoaogsuptuvrtk.supabase.co");
  });
});
