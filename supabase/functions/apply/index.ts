// Edge Function `apply`: recebe a candidatura do site e grava no banco.
// Publicada com verify_jwt = false (ver supabase/config.toml): o site não
// manda chave nenhuma, e a segurança está no handler (origem, validação,
// limites de tentativas e, se ligado, Turnstile).
//
// Variáveis (Supabase › Edge Functions › Secrets):
//   SUPABASE_URL, SUPABASE_SECRET_KEYS   já vêm prontas no Supabase
//   ALLOWED_ORIGINS        opcional: origens extras, separadas por vírgula
//   TURNSTILE_SECRET_KEY   opcional: liga a verificação anti-robô da Cloudflare
//   HASH_SECRET            opcional: chave do HMAC dos limites (padrão: a chave secreta)

import { createClient } from "npm:@supabase/supabase-js@2";
import { createHandler, makeHasher, parseOrigins } from "./handler.ts";

function secretKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const parsed = JSON.parse(keys) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // cai para a chave antiga abaixo
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!legacy) throw new Error("missing secret key");
  return legacy;
}

const key = secretKey();
const db = createClient(Deno.env.get("SUPABASE_URL")!, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append("secret", turnstileSecret!);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`turnstile ${res.status}`);
  const outcome = (await res.json()) as { success?: boolean; action?: string };
  return outcome.success === true && (!outcome.action || outcome.action === "apply");
}

const handler = createHandler({
  rpc: async (fn, args) => {
    const { data, error } = await db.rpc(fn, args);
    return { data, error: error ? { code: error.code, message: error.message } : null };
  },
  hash: await makeHasher(Deno.env.get("HASH_SECRET") ?? key),
  verifyTurnstile: turnstileSecret ? verifyTurnstile : undefined,
  allowedOrigins: parseOrigins(Deno.env.get("ALLOWED_ORIGINS")),
});

Deno.serve(handler);
