// Todos os textos do site num arquivo sÃ³. InglÃªs, com toques de francÃªs.
// Antes de mudar, passe o texto pelo checklist de docs/marca.md
// (sem data de fundaÃ§Ã£o, sem linguagem de venda, frases curtas).

import { SITE } from "../config.ts";
import type { Phase } from "../lib/sun.ts";

export const THRESHOLD = {
  line: "A lawn tennis club on the Riviera. Not yet open.",
  /** Linhas que sÃ³ aparecem em certas horas do dia na CÃ´te d'Azur. */
  phaseLines: {
    heure: "The courts close at sunset. The list does not.",
    nuit: "The club is closed for the night. The list remains open.",
  } as Partial<Record<Phase, string>>,
  cta: "Put your name down",
};

/** Ato I: a histÃ³ria oficial (Drive â€º HistÃ³ria e Posicionamento), uma frase por tela. */
export const HOUR = {
  numeral: "I",
  title: "Lâ€™Heure",
  lines: [
    "Every summer afternoon on the CÃ´te dâ€™Azur has its hour.",
    "The sun slips behind the pines, the clay courts fall into shade and the sea below changes colour.",
    "The last set ends unhurried. Tea is poured on the terrace.",
    "Cap Soleil is that hour, made into a club.",
  ],
};

/** Ato II: as Regras do Clube (proposta, para revisÃ£o dos sÃ³cios). */
export const RULES = {
  numeral: "II",
  title: "Les RÃ¨gles",
  subtitle: "Five rules, kept by the members.",
  items: [
    "Whites are worn on court.",
    "Nobody hurries the last set.",
    "Tea is poured at five.",
    "The sun decides when we stop.",
    "Nothing to prove.",
  ],
};

/** Ato III: fragmentos da Pro Shop. Sem preÃ§o e sem nome de produto. */
export const BOUTIQUE = {
  numeral: "III",
  title: "La Boutique",
  intro: "The Pro Shop opens to the list first.",
  note: "Quiet pieces, for many afternoons like this one.",
  fragments: [
    { no: "01", caption: "Embroidered, Riviera" },
    { no: "02", caption: "Cotton polo, cream" },
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

  ],
  benefits: [
    { no: "01", title: "Pro Shop access", detail: `${hoursInWords(SITE.earlyAccessHours).replace(/^./, (c) => c.toUpperCase())} before anyone else.` },
    { no: "02", title: "Les Lettres du Club", detail: "Occasional letters. Never more than one a month." },
  ],
  invitation: {
    heading: "Your place at the club.",
    place: "CAP SOLEIL Â· CÃ”TE Dâ€™AZUR",
    kicker: "A LETTER FROM THE CLUB",
    title: "Les Lettres du Club",
    lines: ["Clay, pines and the Mediterranean."],
  },
  card: {
    proposed: "Proposed for membership",
    namePlaceholder: "Your name",
    place: "CÃ´te dâ€™Azur",
    numberLabel: "NÂº",
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
  sending: "Sealingâ€¦",
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
  place: "CÃ´te dâ€™Azur",
  privacy: "Privacy",
  legal: "Legal notice",
};

function hoursInWords(hours: number): string {
  const words: Record<number, string> = { 24: "twenty-four hours", 48: "forty-eight hours", 72: "seventy-two hours" };
  return words[hours] ?? `${hours} hours`;
}


/** Páginas editoriais da Pro Shop, aprovadas por Felipe. */
export const PRODUCT_COPY = {
  "copy0": "La Boutique",
  "copy1": "/",
  "copy2": "Embroidered, Riviera",
  "copy3": "On the terrace, after the last set.",
  "copy4": "Nº 01 · LA BOUTIQUE",
  "copy5": "Embroidered,",
  "copy6": "Riviera",
  "copy7": "The half-zip pullover.",
  "copy8": "A navy layer for the quieter hours. A raised collar, a half zip and the club emblem, embroidered discreetly on the chest.",
  "copy9": "Navy · cream &amp; gold embroidery",
  "copy10": "Silhouette",
  "copy11": "Long sleeves · half zip",
  "copy12": "Signature",
  "copy13": "Small embroidered club emblem",
  "copy14": "Availability",
  "copy15": "The list opens first",
  "copy16": "PUT YOUR NAME DOWN",
  "copy17": "Pro Shop access, forty-eight hours before anyone else.",
  "copy18": "THE CLUB, IN THE DETAILS",
  "copy19": "A quiet signature.",
  "copy20": "The cream and gold emblem sits against deep navy. A small detail, carried from the court to the terrace.",
  "copy21": "For many afternoons like this one.",
  "copy22": "The folded half zip, with the club signature in focus.",
  "copy23": "Nº 01",
  "copy24": "Embroidered, Riviera →",
  "copy25": "Nº 02",
  "copy26": "Cotton polo, cream →",
  "copy27": "Nº 03",
  "copy28": "Stitched brim, navy →",
  "copy29": "Back to La Boutique",
  "copy30": "La Boutique",
  "copy31": "/",
  "copy32": "Cotton polo, cream",
  "copy33": "Beside the court, in the afternoon light.",
  "copy34": "Nº 02 · LA BOUTIQUE",
  "copy35": "Cotton polo,",
  "copy36": "cream",
  "copy37": "The cotton polo.",
  "copy38": "A cream polo for afternoons on the Riviera. A simple collar, short sleeves and the club emblem, quietly placed on the chest.",
  "copy39": "Cream · navy &amp; gold embroidery",
  "copy40": "Silhouette",
  "copy41": "Short sleeves · polo collar",
  "copy42": "Signature",
  "copy43": "Small embroidered club emblem",
  "copy44": "Availability",
  "copy45": "The list opens first",
  "copy46": "PUT YOUR NAME DOWN",
  "copy47": "Pro Shop access, forty-eight hours before anyone else.",
  "copy48": "THE CLUB, IN THE DETAILS",
  "copy49": "Light, with a signature.",
  "copy50": "The navy and gold emblem rests against cream. A quiet meeting of the club colours, beside the warmth of the clay court.",
  "copy51": "For many afternoons like this one.",
  "copy52": "A closer look at the same piece.",
  "copy53": "Nº 01",
  "copy54": "Embroidered, Riviera →",
  "copy55": "Nº 02",
  "copy56": "Cotton polo, cream →",
  "copy57": "Nº 03",
  "copy58": "Stitched brim, navy →",
  "copy59": "Back to La Boutique",
  "copy60": "La Boutique",
  "copy61": "/",
  "copy62": "Stitched brim, navy",
  "copy63": "On the stone ledge, in the last of the sun.",
  "copy64": "Nº 03 · LA BOUTIQUE",
  "copy65": "Stitched brim,",
  "copy66": "navy",
  "copy67": "The navy cap.",
  "copy68": "Deep navy, a curved brim and a small club signature. A piece for the sunlit path between the court and the terrace.",
  "copy69": "Navy · discreet club embroidery",
  "copy70": "Silhouette",
  "copy71": "Curved brim · stitched finish",
  "copy72": "Signature",
  "copy73": "Small embroidered club emblem",
  "copy74": "Availability",
  "copy75": "The list opens first",
  "copy76": "PUT YOUR NAME DOWN",
  "copy77": "Pro Shop access, forty-eight hours before anyone else.",
  "copy78": "THE CLUB, IN THE DETAILS",
  "copy79": "Under the Riviera sun.",
  "copy80": "The small emblem and stitched brim give the navy cap its quiet character. A familiar silhouette, in the colours of the club.",
  "copy81": "For many afternoons like this one.",
  "copy82": "A closer look at the same piece.",
  "copy83": "Nº 01",
  "copy84": "Embroidered, Riviera →",
  "copy85": "Nº 02",
  "copy86": "Cotton polo, cream →",
  "copy87": "Nº 03",
  "copy88": "Stitched brim, navy →",
  "copy89": "Back to La Boutique"
} as const;

