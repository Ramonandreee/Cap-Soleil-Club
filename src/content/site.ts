// Todos os textos do site num arquivo só. Inglês, com toques de francês.
// Antes de mudar, passe o texto pelo checklist de docs/marca.md
// (sem data de fundação, sem linguagem de venda, frases curtas).

import { SITE } from "../config.ts";
import type { Phase } from "../lib/sun.ts";

export const THRESHOLD = {
  line: "A lawn tennis club on the Riviera. Not yet open.",
  /** Linhas que só aparecem em certas horas do dia na Côte d'Azur. */
  phaseLines: {
    heure: "The courts close at sunset. The list does not.",
    nuit: "The club is closed for the night. The list remains open.",
  } as Partial<Record<Phase, string>>,
  cta: "Put your name down",
};

/** Ato I: a história oficial (Drive › História e Posicionamento), uma frase por tela. */
export const HOUR = {
  numeral: "I",
  title: "L’Heure",
  lines: [
    "Every summer afternoon on the Côte d’Azur has its hour.",
    "The sun slips behind the pines, the clay courts fall into shade and the sea below changes colour.",
    "The last set ends unhurried. Tea is poured on the terrace.",
    "Cap Soleil is that hour, made into a club.",
  ],
};

/** Ato II: as Regras do Clube (proposta, para revisão dos sócios). */
export const RULES = {
  numeral: "II",
  title: "Les Règles",
  subtitle: "Five rules, kept by the members.",
  items: [
    "Whites are worn on court.",
    "Nobody hurries the last set.",
    "Tea is poured at five.",
    "The sun decides when we stop.",
    "Nothing to prove.",
  ],
};

/** Ato III: fragmentos da Pro Shop. Sem preço e sem nome de produto. */
export const BOUTIQUE = {
  numeral: "III",
  title: "La Boutique",
  intro: "The Pro Shop opens to the list first.",
  note: `Members of the list are let in ${hoursInWords(SITE.earlyAccessHours)} before anyone else.`,
  fragments: [
    { no: "01", caption: "Embroidered, Riviera" },
    { no: "02", caption: "Cable knit, cream" },
    { no: "03", caption: "Stitched brim, navy" },
  ],
};

/** Ato IV: a candidatura. */
export const LIST = {
  numeral: "IV",
  title: "La Liste",
  heading: "Put your name down",
  intro: [
    "The list is how the club begins.",
    `Members of the list enter the Pro Shop ${hoursInWords(SITE.earlyAccessHours)} before anyone else, and receive Les Lettres du Club: rare, and never more than one a month.`,
  ],
  card: {
    proposed: "Proposed for membership",
    namePlaceholder: "Your name",
    place: "Côte d’Azur",
    numberLabel: "Nº",
    sealed: "Sealed",
  },
  fields: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    country: "Country",
    countryHint: "optional",
    countryEmpty: "Select a country",
    phone: "WhatsApp",
    phoneHint: "The code follows the country above. For a number from elsewhere, start with +.",
  },
  consent:
    "Send me Les Lettres du Club by email and WhatsApp: the opening of the Pro Shop and rare news from the club, at most one a month. I can leave the list at any time.",
  privacyLink: "How we look after your details",
  submit: "Put my name down",
  sending: "Sealing…",
  success: {
    title: "Your name is down.",
    body: "When the Pro Shop opens, the list hears first.",
  },
  errors: {
    firstName: {
      required: "Please write your first name.",
      invalid: "Please write your first name using letters.",
      too_long: "Please shorten your first name to 80 characters.",
    },
    lastName: {
      required: "Please write your last name.",
      invalid: "Please write your last name using letters.",
      too_long: "Please shorten your last name to 80 characters.",
    },
    email: {
      required: "Please write your email address.",
      invalid: "Please check your email address.",
      too_long: "Please check your email address.",
    },
    country: { required: "Please choose a country.", invalid: "Please choose a country from the list.", too_long: "" },
    phone: {
      required: "Please write your WhatsApp number.",
      invalid: "Please check the number. Choose your country above, or start with + and the country code.",
      too_long: "Please check the number. Choose your country above, or start with + and the country code.",
    },
    consent: {
      required: "Please tick the box to receive the letters.",
      invalid: "Please reload the page and tick the box again.",
      too_long: "",
    },
    suggestion: "Did you mean",
    network: "The line to the club seems to be down. Your details are still here. Please try again.",
    server: "Something went wrong on our side. Please try again in a moment.",
    rateLimited: "Too many attempts. Please try again later.",
    challenge: "We could not confirm this request. Please try again.",
    tooFast: "One moment, then try again.",
  },
  noscript: "The list needs JavaScript to work.",
};

export const FOOTER = {
  place: "Côte d’Azur",
  privacy: "Privacy",
  legal: "Legal notice",
};

function hoursInWords(hours: number): string {
  const words: Record<number, string> = { 24: "twenty-four hours", 48: "forty-eight hours", 72: "seventy-two hours" };
  return words[hours] ?? `${hours} hours`;
}
