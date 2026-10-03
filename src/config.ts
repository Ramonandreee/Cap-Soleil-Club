// Configuração do site num lugar só. Endereços e chaves públicas vêm do
// ambiente (Cloudflare Pages › Settings › Environment variables); o resto
// é conteúdo e pode ser editado aqui.

export const SITE = {
  name: "Cap Soleil Lawn Tennis Club",
  shortName: "Cap Soleil",
  description:
    "A lawn tennis club on the Riviera, not yet open. Put your name down: the list enters the Pro Shop first.",
  instagram: "https://www.instagram.com/capsoleilclub/",
  instagramHandle: "@capsoleilclub",
  /** E-mail de contato público. Vazio = não aparece no rodapé (sessão D5 do roadmap). */
  contactEmail: "",
  /** Promessa da lista: horas de acesso antecipado à Pro Shop. Precisa ser cumprida. */
  earlyAccessHours: 48,
  /** Cap d'Antibes: o céu do site segue o sol deste ponto. */
  place: { lat: 43.5598, lon: 7.1185, timeZone: "Europe/Paris" },
} as const;

/** Função que recebe as candidaturas (Supabase Edge Function `apply`). */
export const APPLY_URL: string =
  import.meta.env.PUBLIC_APPLY_URL || "https://anlniqjoaogsuptuvrtk.supabase.co/functions/v1/apply";

/** Chave pública do Cloudflare Turnstile. Vazia = anti-robô da Cloudflare desligado. */
export const TURNSTILE_SITE_KEY: string = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "";
