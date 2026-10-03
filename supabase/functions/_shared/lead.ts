// Regras da candidatura ("Put your name down"), usadas nos dois lados:
//   • no navegador (src/scripts/apply.ts), para avisar o visitante na hora;
//   • na Edge Function `apply`, que é quem decide de verdade.
// Sem dependências: roda no Deno (Supabase) e no Vite (Astro).

/** Versões do texto de consentimento que o site já mostrou. A mais nova é a primeira. */
export const CONSENT_VERSIONS = ["2026-10-03"] as const;
export const CONSENT_VERSION = CONSENT_VERSIONS[0];

export const LIMITS = {
  firstName: 80,
  email: 254,
  utm: 120,
  host: 255,
  path: 255,
  locale: 16,
  /** Tamanho máximo do corpo da requisição, em bytes. */
  body: 4096,
  /** Tempo mínimo entre o formulário ficar pronto e o envio (anti-robô). */
  minElapsedMs: 1200,
} as const;

/** ISO 3166-1 alfa-2. Os nomes em inglês vêm do Intl.DisplayNames na hora do build. */
export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

const COUNTRY_SET: ReadonlySet<string> = new Set(COUNTRY_CODES);

export type Field = "firstName" | "email" | "country" | "consent";
export type FieldError = "required" | "invalid" | "too_long";
export type DeviceClass = "mobile" | "tablet" | "desktop";

/** O que o navegador envia para a função `apply`. */
export interface ApplyPayload {
  firstName: string;
  email: string;
  country?: string;
  consent: boolean;
  consentVersion: string;
  locale?: string;
  utm?: Partial<Record<UtmKey, string>>;
  referrer?: string;
  path?: string;
  device?: DeviceClass;
  invite?: string;
  phase?: string;
  /** Milissegundos entre o formulário ficar pronto e o envio. */
  elapsedMs?: number;
  /** Campo-armadilha: invisível para pessoas, robôs preenchem. */
  website?: string;
  turnstileToken?: string;
}

/** A candidatura já limpa, pronta para o banco. */
export interface Lead {
  firstName: string;
  email: string;
  country: string | null;
  consentVersion: string;
  locale: string;
  utm: Partial<Record<UtmKey, string>>;
  referrerHost: string | null;
  landingPath: string | null;
  device: DeviceClass | null;
  invite: string | null;
  phase: string | null;
}

export type UtmKey = "source" | "medium" | "campaign" | "content" | "term";
const UTM_KEYS: readonly UtmKey[] = ["source", "medium", "campaign", "content", "term"];

export type Validation =
  | { ok: true; lead: Lead; honeypot: boolean; elapsedMs: number | null }
  | { ok: false; errors: Partial<Record<Field, FieldError>>; reason?: "shape" };

// Caracteres de controle e de formatação invisíveis (zero-width, marcas de direção, BOM…).
const CONTROL = /[\p{Cc}\p{Cf}]/gu;
const LETTER = /\p{L}/u;
const NAME_FORBIDDEN = /[<>{}[\]\\/@#$%^*=|~`"]|https?:|www\.|\.(com|net|org|ru|xyz|io)\b/i;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const LOCALE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/;
const HOST = /^(?=.{1,255}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const INVITE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
const PHASES = new Set(["nuit", "aube", "matin", "midi", "heure", "crepuscule"]);
const DEVICES = new Set<DeviceClass>(["mobile", "tablet", "desktop"]);

export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").replace(/\s+/g, " ").replace(CONTROL, "").trim().slice(0, max);
}

export function normaliseEmail(value: unknown): string {
  return clean(value, LIMITS.email + 1).toLowerCase();
}

export function checkFirstName(value: unknown): FieldError | null {
  const raw = typeof value === "string" ? value.replace(CONTROL, "").trim() : "";
  if (!raw) return "required";
  if (raw.length > LIMITS.firstName) return "too_long";
  if (!LETTER.test(raw) || NAME_FORBIDDEN.test(raw)) return "invalid";
  return null;
}

export function checkEmail(value: unknown): FieldError | null {
  const email = normaliseEmail(value);
  if (!email) return "required";
  if (email.length > LIMITS.email) return "too_long";
  const [local, domain] = email.split("@");
  if (!EMAIL.test(email) || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "invalid";
  }
  if (domain.split(".").some((label) => label.startsWith("-") || label.endsWith("-"))) return "invalid";
  return null;
}

export function checkCountry(value: unknown): FieldError | null {
  if (value === undefined || value === null || value === "") return null; // opcional
  return typeof value === "string" && COUNTRY_SET.has(value.toUpperCase()) ? null : "invalid";
}

/** Valida o que chegou do navegador. Nunca confia no tipo declarado. */
export function validatePayload(input: unknown): Validation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: {}, reason: "shape" };
  }
  const p = input as Record<string, unknown>;
  const errors: Partial<Record<Field, FieldError>> = {};

  const nameError = checkFirstName(p.firstName);
  if (nameError) errors.firstName = nameError;
  const emailError = checkEmail(p.email);
  if (emailError) errors.email = emailError;
  const countryError = checkCountry(p.country);
  if (countryError) errors.country = countryError;
  if (p.consent !== true) errors.consent = "required";
  const consentVersion = typeof p.consentVersion === "string" ? p.consentVersion : "";
  if (!(CONSENT_VERSIONS as readonly string[]).includes(consentVersion)) errors.consent ??= "invalid";

  if (Object.keys(errors).length) return { ok: false, errors };

  const utm: Partial<Record<UtmKey, string>> = {};
  if (p.utm && typeof p.utm === "object" && !Array.isArray(p.utm)) {
    for (const key of UTM_KEYS) {
      const value = clean((p.utm as Record<string, unknown>)[key], LIMITS.utm);
      if (value) utm[key] = value;
    }
  }

  const referrer = clean(p.referrer, LIMITS.host).toLowerCase();
  const path = clean(p.path, LIMITS.path);
  const locale = clean(p.locale, LIMITS.locale);
  const invite = clean(p.invite, 16).toUpperCase();
  const phase = clean(p.phase, 16);
  const device = clean(p.device, 16) as DeviceClass;
  const elapsed = typeof p.elapsedMs === "number" && Number.isFinite(p.elapsedMs) ? p.elapsedMs : null;

  return {
    ok: true,
    honeypot: clean(p.website, 200) !== "",
    elapsedMs: elapsed,
    lead: {
      firstName: clean(p.firstName, LIMITS.firstName),
      email: normaliseEmail(p.email),
      country: typeof p.country === "string" && p.country ? p.country.toUpperCase() : null,
      consentVersion,
      locale: LOCALE.test(locale) ? locale : "en",
      utm,
      referrerHost: HOST.test(referrer) ? referrer : null,
      landingPath: path.startsWith("/") ? path : null,
      device: DEVICES.has(device) ? device : null,
      invite: INVITE.test(invite) ? invite : null,
      phase: PHASES.has(phase) ? phase : null,
    },
  };
}

// ---------- Sugestão de e-mail ("Did you mean …?") ----------

const COMMON_DOMAINS = [
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.fr", "hotmail.co.uk", "outlook.com", "outlook.fr",
  "live.com", "live.fr", "yahoo.com", "yahoo.fr", "yahoo.co.uk", "yahoo.com.br", "icloud.com", "me.com",
  "mac.com", "msn.com", "aol.com", "mail.com", "ymail.com", "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.de", "gmx.net", "gmx.fr", "web.de", "t-online.de", "orange.fr", "free.fr", "laposte.net",
  "wanadoo.fr", "sfr.fr", "libero.it", "virgilio.it", "uol.com.br", "bol.com.br", "terra.com.br",
];

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

/** Sugere a correção de um domínio comum digitado errado (ex.: gmial.com → gmail.com). */
export function suggestEmail(value: unknown): string | null {
  const email = normaliseEmail(value);
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1);
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestScore = 3;
  for (const candidate of COMMON_DOMAINS) {
    const score = distance(domain, candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best && bestScore <= (domain.length > 6 ? 2 : 1) ? `${email.slice(0, at)}@${best}` : null;
}
