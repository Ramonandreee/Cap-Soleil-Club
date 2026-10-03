// Regras da candidatura ("Put your name down"), usadas nos dois lados:
//   • no navegador (src/scripts/apply.ts), para avisar o visitante na hora;
//   • na Edge Function `apply`, que é quem decide de verdade.
// Sem dependências: roda no Deno (Supabase) e no Vite (Astro).

/**
 * Versões do texto de consentimento que o site já mostrou. A mais nova é a primeira.
 *   2026-10-03.2  cartas por e-mail e WhatsApp (com sobrenome e WhatsApp no formulário)
 *   2026-10-03    cartas por e-mail
 */
export const CONSENT_VERSIONS = ["2026-10-03.2", "2026-10-03"] as const;
export const CONSENT_VERSION = CONSENT_VERSIONS[0];

export const LIMITS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  /** O que a pessoa digita no WhatsApp, com espaços e traços. */
  phone: 32,
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

/**
 * Código de discagem de cada país (sem o +), para completar o WhatsApp de quem
 * digita o número local. Territórios sem código próprio usam o do país que os
 * atende (ex.: BV → Noruega).
 */
export const DIAL_CODES: Readonly<Record<(typeof COUNTRY_CODES)[number], string>> = {
  AD: "376", AE: "971", AF: "93", AG: "1", AI: "1", AL: "355", AM: "374", AO: "244", AQ: "672", AR: "54",
  AS: "1", AT: "43", AU: "61", AW: "297", AX: "358", AZ: "994", BA: "387", BB: "1", BD: "880", BE: "32",
  BF: "226", BG: "359", BH: "973", BI: "257", BJ: "229", BL: "590", BM: "1", BN: "673", BO: "591", BQ: "599",
  BR: "55", BS: "1", BT: "975", BV: "47", BW: "267", BY: "375", BZ: "501", CA: "1", CC: "61", CD: "243",
  CF: "236", CG: "242", CH: "41", CI: "225", CK: "682", CL: "56", CM: "237", CN: "86", CO: "57", CR: "506",
  CU: "53", CV: "238", CW: "599", CX: "61", CY: "357", CZ: "420", DE: "49", DJ: "253", DK: "45", DM: "1",
  DO: "1", DZ: "213", EC: "593", EE: "372", EG: "20", EH: "212", ER: "291", ES: "34", ET: "251", FI: "358",
  FJ: "679", FK: "500", FM: "691", FO: "298", FR: "33", GA: "241", GB: "44", GD: "1", GE: "995", GF: "594",
  GG: "44", GH: "233", GI: "350", GL: "299", GM: "220", GN: "224", GP: "590", GQ: "240", GR: "30", GS: "500",
  GT: "502", GU: "1", GW: "245", GY: "592", HK: "852", HM: "672", HN: "504", HR: "385", HT: "509", HU: "36",
  ID: "62", IE: "353", IL: "972", IM: "44", IN: "91", IO: "246", IQ: "964", IR: "98", IS: "354", IT: "39",
  JE: "44", JM: "1", JO: "962", JP: "81", KE: "254", KG: "996", KH: "855", KI: "686", KM: "269", KN: "1",
  KP: "850", KR: "82", KW: "965", KY: "1", KZ: "7", LA: "856", LB: "961", LC: "1", LI: "423", LK: "94",
  LR: "231", LS: "266", LT: "370", LU: "352", LV: "371", LY: "218", MA: "212", MC: "377", MD: "373", ME: "382",
  MF: "590", MG: "261", MH: "692", MK: "389", ML: "223", MM: "95", MN: "976", MO: "853", MP: "1", MQ: "596",
  MR: "222", MS: "1", MT: "356", MU: "230", MV: "960", MW: "265", MX: "52", MY: "60", MZ: "258", NA: "264",
  NC: "687", NE: "227", NF: "672", NG: "234", NI: "505", NL: "31", NO: "47", NP: "977", NR: "674", NU: "683",
  NZ: "64", OM: "968", PA: "507", PE: "51", PF: "689", PG: "675", PH: "63", PK: "92", PL: "48", PM: "508",
  PN: "64", PR: "1", PS: "970", PT: "351", PW: "680", PY: "595", QA: "974", RE: "262", RO: "40", RS: "381",
  RU: "7", RW: "250", SA: "966", SB: "677", SC: "248", SD: "249", SE: "46", SG: "65", SH: "290", SI: "386",
  SJ: "47", SK: "421", SL: "232", SM: "378", SN: "221", SO: "252", SR: "597", SS: "211", ST: "239", SV: "503",
  SX: "1", SY: "963", SZ: "268", TC: "1", TD: "235", TF: "262", TG: "228", TH: "66", TJ: "992", TK: "690",
  TL: "670", TM: "993", TN: "216", TO: "676", TR: "90", TT: "1", TV: "688", TW: "886", TZ: "255", UA: "380",
  UG: "256", UM: "1", US: "1", UY: "598", UZ: "998", VA: "39", VC: "1", VE: "58", VG: "1", VI: "1",
  VN: "84", VU: "678", WF: "681", WS: "685", YE: "967", YT: "262", ZA: "27", ZM: "260", ZW: "263",
};

export type Field = "firstName" | "lastName" | "email" | "country" | "phone" | "consent";
export type FieldError = "required" | "invalid" | "too_long";
export type DeviceClass = "mobile" | "tablet" | "desktop";

/** O que o navegador envia para a função `apply`. */
export interface ApplyPayload {
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  /** WhatsApp como a pessoa digitou; o país completa o código quando falta o +. */
  phone: string;
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
  lastName: string;
  email: string;
  country: string | null;
  /** WhatsApp no formato E.164 (ex.: +33612345678). */
  phone: string;
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

/** Nome ou sobrenome: letras de qualquer língua, até 80 caracteres, nada de links. */
export function checkName(value: unknown): FieldError | null {
  const raw = typeof value === "string" ? value.replace(CONTROL, "").trim() : "";
  if (!raw) return "required";
  if (raw.length > LIMITS.firstName) return "too_long";
  if (!LETTER.test(raw) || NAME_FORBIDDEN.test(raw)) return "invalid";
  return null;
}

export const checkFirstName = checkName;
export const checkLastName = checkName;

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

const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const E164_DIGITS = /^[1-9]\d{7,14}$/;

/**
 * WhatsApp em E.164 (+ código do país + número), ou null se não der para saber.
 * Aceita "+33 6 12 34 56 78", "0033 6…" e, com o país escolhido, o número local
 * ("06 12 34 56 78" na França vira +33612345678; o 0 de tronco sai, menos na
 * Itália, em San Marino e no Vaticano, onde ele faz parte do número).
 */
export function normalisePhone(value: unknown, country?: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.replace(CONTROL, "").trim();
  if (!raw || raw.length > LIMITS.phone || !PHONE_CHARS.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  let international = raw.startsWith("+");
  if (!international && digits.startsWith("00")) {
    international = true;
    digits = digits.slice(2);
  }
  if (!international) {
    const code = typeof country === "string" ? DIAL_CODES[country.toUpperCase() as keyof typeof DIAL_CODES] : undefined;
    if (!code) return null;
    if (digits.startsWith("0") && code !== "39" && code !== "378") digits = digits.slice(1);
    else if (code === "1" && digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    else if (code === "7" && digits.length === 11 && digits.startsWith("8")) digits = digits.slice(1);
    if (digits.length < 6) return null;
    digits = code + digits;
  }
  return E164_DIGITS.test(digits) ? `+${digits}` : null;
}

export function checkPhone(value: unknown, country?: unknown): FieldError | null {
  const raw = typeof value === "string" ? value.replace(CONTROL, "").trim() : "";
  if (!raw) return "required";
  if (raw.length > LIMITS.phone) return "too_long";
  return normalisePhone(raw, country) ? null : "invalid";
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
  const lastNameError = checkLastName(p.lastName);
  if (lastNameError) errors.lastName = lastNameError;
  const emailError = checkEmail(p.email);
  if (emailError) errors.email = emailError;
  const countryError = checkCountry(p.country);
  if (countryError) errors.country = countryError;
  const phoneError = checkPhone(p.phone, countryError ? undefined : p.country);
  if (phoneError) errors.phone = phoneError;
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
      lastName: clean(p.lastName, LIMITS.lastName),
      email: normaliseEmail(p.email),
      country: typeof p.country === "string" && p.country ? p.country.toUpperCase() : null,
      phone: normalisePhone(p.phone, p.country)!,
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
