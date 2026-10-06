// Lógica da função `apply`, separada do Deno.serve para poder ser testada
// no Node (tests/unit/handler.test.ts) sem banco e sem rede.
//
// Ordem das defesas: origem (CORS) → método → tipo e tamanho do corpo →
// validação → campo-armadilha → tempo mínimo → Turnstile (se ligado) →
// limites de tentativas → banco. A resposta de sucesso é sempre a mesma,
// seja um nome novo ou repetido: ninguém descobre quem já está na lista.

import { LIMITS, validatePayload, type Lead } from "../_shared/lead.ts";

export interface RpcResult {
  data: unknown;
  error: { code?: string; message: string } | null;
}

export interface Deps {
  rpc(fn: "club_apply" | "club_rate_limit_hit", args: Record<string, unknown>): Promise<RpcResult>;
  /** HMAC do IP ou do e-mail, para que o banco nunca guarde esses valores em claro. */
  hash(value: string): Promise<string>;
  /** Presente só quando o Turnstile está ligado (TURNSTILE_SECRET_KEY). */
  verifyTurnstile?: (token: string, ip: string | null) => Promise<boolean>;
  allowedOrigins: readonly string[];
  log?: (entry: Record<string, unknown>) => void;
  now?: () => number;
}

export const RATE_LIMITS = {
  /** Freio geral contra enxurradas. */
  all: { windowSeconds: 60, max: 120 },
  /** Por IP (com hash). Generoso para redes compartilhadas (escritórios, 4G). */
  ip: { windowSeconds: 600, max: 10 },
  /** Por e-mail (com hash). */
  email: { windowSeconds: 3600, max: 4 },
} as const;

export const DEFAULT_ORIGINS = [
  "https://capsoleilclub.com",
  "https://www.capsoleilclub.com",
  "https://cap-soleil-club.pages.dev",
  "https://*.cap-soleil-club.pages.dev",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
] as const;

/** Lê ALLOWED_ORIGINS ("https://a.com, https://*.b.dev") e soma aos padrões. */
export function parseOrigins(env: string | undefined): string[] {
  const extra = (env ?? "").split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

export function originAllowed(origin: string | null, allowed: readonly string[]): boolean {
  if (!origin) return false;
  return allowed.some((rule) => {
    if (!rule.includes("*")) return rule === origin;
    const pattern = rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("*", "[a-z0-9-]+");
    return new RegExp(`^${pattern}$`).test(origin);
  });
}

export function clientIp(headers: Headers): string | null {
  const direct = headers.get("cf-connecting-ip") ?? headers.get("x-real-ip");
  if (direct) return direct.trim();
  const forwarded = headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() || null : null;
}

/** HMAC-SHA256 em hexadecimal (32 caracteres bastam para a chave do limite). */
export async function makeHasher(secret: string): Promise<(value: string) => Promise<string>> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return async (value: string) => {
    const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
    return Array.from(signature.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
  };
}

function rpcArgs(lead: Lead): Record<string, unknown> {
  return {
    p_email: lead.email,
    p_first_name: lead.firstName,
    p_last_name: lead.lastName,
    p_phone_e164: lead.phone,
    p_country_code: lead.country,
    p_locale: lead.locale,
    p_consent: true,
    p_consent_version: lead.consentVersion,
    p_utm: lead.utm,
    p_referrer_host: lead.referrerHost,
    p_landing_path: lead.landingPath,
    p_device_class: lead.device,
    p_invite_code: lead.invite,
    p_metadata: lead.phase ? { form: "v2", phase: lead.phase } : { form: "v2" },
  };
}

export function createHandler(deps: Deps): (req: Request) => Promise<Response> {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((entry) => console.log(JSON.stringify(entry)));

  return async function handle(req: Request): Promise<Response> {
    const started = now();
    const origin = req.headers.get("origin");
    const allowed = originAllowed(origin, deps.allowedOrigins);

    const cors: Record<string, string> = allowed
      ? {
        "Access-Control-Allow-Origin": origin!,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Max-Age": "86400",
      }
      : {};

    const reply = (status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) => {
      log({ fn: "apply", status, outcome: body.outcome ?? body.error ?? "ok", ms: now() - started });
      delete body.outcome; // só para o log
      return new Response(JSON.stringify(body), {
        status,
        headers: {
          ...cors,
          ...extra,
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          Vary: "Origin",
        },
      });
    };

    if (req.method === "OPTIONS") {
      if (!allowed) return reply(403, { error: "origin" });
      return new Response(null, { status: 204, headers: { ...cors, Vary: "Origin" } });
    }
    if (req.method !== "POST") return reply(405, { error: "method" }, { Allow: "POST, OPTIONS" });
    if (!allowed) return reply(403, { error: "origin" });

    if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return reply(415, { error: "content_type" });
    }
    const declared = Number(req.headers.get("content-length") ?? "0");
    if (declared > LIMITS.body) return reply(413, { error: "too_large" });

    let text: string;
    try {
      text = await req.text();
    } catch {
      return reply(400, { error: "invalid_json" });
    }
    if (new TextEncoder().encode(text).length > LIMITS.body) return reply(413, { error: "too_large" });

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return reply(400, { error: "invalid_json" });
    }

    const result = validatePayload(payload);
    if (!result.ok) return reply(400, { error: "invalid", fields: result.errors });

    // Robô que preencheu o campo invisível: responde como sucesso e não grava nada.
    if (result.honeypot) return reply(200, { ok: true, outcome: "honeypot" });

    if (result.elapsedMs === null || result.elapsedMs < LIMITS.minElapsedMs) {
      return reply(400, { error: "too_fast" });
    }

    const ip = clientIp(req.headers);

    if (deps.verifyTurnstile) {
      const token = (payload as Record<string, unknown>).turnstileToken;
      if (typeof token !== "string" || !token || token.length > 2048) return reply(403, { error: "challenge" });
      let passed = false;
      try {
        passed = await deps.verifyTurnstile(token, ip);
      } catch {
        return reply(503, { error: "challenge_unavailable" });
      }
      if (!passed) return reply(403, { error: "challenge" });
    }

    const { lead } = result;
    const checks: Array<[string, { windowSeconds: number; max: number }]> = [
      ["apply:all", RATE_LIMITS.all],
      [`apply:ip:${await deps.hash(`ip:${ip ?? "unknown"}`)}`, RATE_LIMITS.ip],
      [`apply:em:${await deps.hash(`email:${lead.email}`)}`, RATE_LIMITS.email],
    ];
    for (const [key, limit] of checks) {
      const { data, error } = await deps.rpc("club_rate_limit_hit", {
        p_key: key,
        p_window_seconds: limit.windowSeconds,
        p_max: limit.max,
      });
      if (error) return reply(500, { error: "server", outcome: `rate_limit_error:${error.code ?? "?"}` });
      if (data === false) {
        return reply(429, { error: "rate_limited" }, { "Retry-After": String(limit.windowSeconds) });
      }
    }

    const { data, error } = await deps.rpc("club_apply", rpcArgs(lead));
    if (error) {
      if (error.code === "22023" || error.code === "23514") return reply(400, { error: "invalid", fields: {} });
      return reply(500, { error: "server", outcome: `db_error:${error.code ?? "?"}` });
    }

    // "created" ou "existing" vão só para o log. O visitante recebe sempre a mesma resposta.
    return reply(200, { ok: true, outcome: typeof data === "string" ? data : "ok" });
  };
}
