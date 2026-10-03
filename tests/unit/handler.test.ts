import { describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION } from "../../supabase/functions/_shared/lead.ts";
import {
  clientIp,
  createHandler,
  makeHasher,
  originAllowed,
  parseOrigins,
  type Deps,
} from "../../supabase/functions/apply/handler.ts";

const ORIGIN = "https://capsoleilclub.com";
const body = {
  firstName: "Ana",
  email: "Ana@Example.com",
  country: "FR",
  consent: true,
  consentVersion: CONSENT_VERSION,
  elapsedMs: 4000,
  utm: { source: "instagram" },
};

function setup(overrides: Partial<Deps> = {}, applyResult: unknown = "created") {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const logs: Array<Record<string, unknown>> = [];
  const deps: Deps = {
    rpc: vi.fn(async (fn, args) => {
      calls.push({ fn, args });
      if (fn === "club_rate_limit_hit") return { data: true, error: null };
      return { data: applyResult, error: null };
    }),
    hash: async (v) => `h(${v})`,
    allowedOrigins: parseOrigins(undefined),
    log: (e) => logs.push(e),
    ...overrides,
  };
  return { handle: createHandler(deps), calls, logs };
}

function post(payload: unknown, headers: Record<string, string> = {}) {
  return new Request("https://x.supabase.co/functions/v1/apply", {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "203.0.113.9, 10.0.0.1", ...headers },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

describe("origins", () => {
  it("matches exact and wildcard rules", () => {
    const allowed = parseOrigins("https://extra.example, https://*.preview.dev/");
    expect(originAllowed("https://capsoleilclub.com", allowed)).toBe(true);
    expect(originAllowed("https://abc123.cap-soleil-club.pages.dev", allowed)).toBe(true);
    expect(originAllowed("https://a.b.cap-soleil-club.pages.dev", allowed)).toBe(false);
    expect(originAllowed("https://evil.com", allowed)).toBe(false);
    expect(originAllowed("https://capsoleilclub.com.evil.com", allowed)).toBe(false);
    expect(originAllowed("https://extra.example", allowed)).toBe(true);
    expect(originAllowed("https://x1.preview.dev", allowed)).toBe(true);
    expect(originAllowed(null, allowed)).toBe(false);
  });
});

describe("clientIp", () => {
  it("prefers cf-connecting-ip, then x-real-ip, then the first forwarded address", () => {
    expect(clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(clientIp(new Headers({ "x-forwarded-for": "4.4.4.4, 5.5.5.5" }))).toBe("4.4.4.4");
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("makeHasher", () => {
  it("is stable, keyed and never returns the input", async () => {
    const a = await makeHasher("secret-a");
    const b = await makeHasher("secret-b");
    expect(await a("ip:1.2.3.4")).toBe(await a("ip:1.2.3.4"));
    expect(await a("ip:1.2.3.4")).not.toBe(await b("ip:1.2.3.4"));
    expect(await a("ip:1.2.3.4")).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("apply handler", () => {
  it("answers the preflight only for allowed origins", async () => {
    const { handle } = setup();
    const ok = await handle(new Request("https://x/apply", { method: "OPTIONS", headers: { origin: ORIGIN } }));
    expect(ok.status).toBe(204);
    expect(ok.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const bad = await handle(new Request("https://x/apply", { method: "OPTIONS", headers: { origin: "https://evil.com" } }));
    expect(bad.status).toBe(403);
    expect(bad.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("stores a valid application and answers 200", async () => {
    const { handle, calls, logs } = setup();
    const res = await handle(post(body));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(calls.map((c) => c.fn)).toEqual(["club_rate_limit_hit", "club_rate_limit_hit", "club_rate_limit_hit", "club_apply"]);
    expect(calls[1].args.p_key).toBe("apply:ip:h(ip:203.0.113.9)");
    expect(calls[2].args.p_key).toBe("apply:em:h(email:ana@example.com)");
    expect(calls[3].args).toMatchObject({
      p_email: "ana@example.com",
      p_first_name: "Ana",
      p_country_code: "FR",
      p_consent: true,
      p_consent_version: CONSENT_VERSION,
      p_utm: { source: "instagram" },
      p_metadata: { form: "v2" },
    });
    expect(logs.at(-1)).toMatchObject({ fn: "apply", status: 200, outcome: "created" });
    expect(JSON.stringify(logs)).not.toContain("ana@example.com");
    expect(JSON.stringify(logs)).not.toContain("203.0.113.9");
  });

  it("gives the same answer when the email is already on the list", async () => {
    const created = await setup({}, "created").handle(post(body));
    const existing = await setup({}, "existing").handle(post(body));
    expect(existing.status).toBe(created.status);
    expect(await existing.text()).toBe(await created.text());
  });

  it("refuses other origins, methods and content types", async () => {
    const { handle, calls } = setup();
    expect((await handle(post(body, { origin: "https://evil.com" }))).status).toBe(403);
    expect((await handle(new Request("https://x/apply", { method: "POST", body: "{}" }))).status).toBe(403);
    expect((await handle(new Request("https://x/apply", { method: "GET", headers: { origin: ORIGIN } }))).status).toBe(405);
    expect((await handle(post(body, { "content-type": "text/plain" }))).status).toBe(415);
    expect(calls).toHaveLength(0);
  });

  it("refuses oversized and malformed bodies", async () => {
    const { handle, calls } = setup();
    expect((await handle(post({ ...body, firstName: "a".repeat(5000) }))).status).toBe(413);
    expect((await handle(post("{not json"))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("returns field errors", async () => {
    const { handle, calls } = setup();
    const res = await handle(post({ ...body, email: "nope", consent: false }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid", fields: { email: "invalid", consent: "required" } });
    expect(calls).toHaveLength(0);
  });

  it("pretends success for the honeypot without touching the database", async () => {
    const { handle, calls } = setup();
    const res = await handle(post({ ...body, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(calls).toHaveLength(0);
  });

  it("refuses submissions that are too fast or carry no timing", async () => {
    const { handle, calls } = setup();
    expect((await handle(post({ ...body, elapsedMs: 300 }))).status).toBe(400);
    expect((await handle(post({ ...body, elapsedMs: undefined }))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("answers 429 with Retry-After when a limit is reached", async () => {
    const { handle } = setup({
      rpc: vi.fn(async (fn, args) => {
        if (fn === "club_rate_limit_hit") return { data: !String(args.p_key).startsWith("apply:em:"), error: null };
        return { data: "created", error: null };
      }),
    });
    const res = await handle(post(body));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("3600");
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("checks Turnstile when it is enabled", async () => {
    const verifyTurnstile = vi.fn(async (token: string) => token === "good");
    const { handle } = setup({ verifyTurnstile });
    expect((await handle(post(body))).status).toBe(403);
    expect((await handle(post({ ...body, turnstileToken: "bad" }))).status).toBe(403);
    expect((await handle(post({ ...body, turnstileToken: "good" }))).status).toBe(200);
    expect(verifyTurnstile).toHaveBeenCalledWith("good", "203.0.113.9");
  });

  it("answers 503 when Turnstile cannot be reached", async () => {
    const { handle } = setup({ verifyTurnstile: async () => { throw new Error("timeout"); } });
    expect((await handle(post({ ...body, turnstileToken: "x" }))).status).toBe(503);
  });

  it("maps database errors without leaking details", async () => {
    const failing = (code: string) =>
      setup({
        rpc: async (fn) => (fn === "club_apply" ? { data: null, error: { code, message: "secret detail" } } : { data: true, error: null }),
      }).handle(post(body));
    const invalid = await failing("23514");
    expect(invalid.status).toBe(400);
    const broken = await failing("XX000");
    expect(broken.status).toBe(500);
    expect(await broken.text()).not.toContain("secret detail");
  });
});
