import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A Cloudflare lê public/_headers; a Vercel, enquanto ainda publica o site, lê o vercel.json.
// As duas listas de cabeçalhos de segurança precisam ser iguais.
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

function vercelHeaders(): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
  const all = config.headers.find((h: { source: string }) => h.source === "/(.*)");
  return Object.fromEntries(all.headers.map((h: { key: string; value: string }) => [h.key, h.value]));
}

describe("security headers", () => {
  it("are the same on Cloudflare and Vercel", () => {
    expect(vercelHeaders()).toEqual(cloudflareHeaders());
  });

  it("keep a strict CSP", () => {
    const csp = cloudflareHeaders()["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("connect-src 'self' https://anlniqjoaogsuptuvrtk.supabase.co");
  });
});
