// As fotos do site, uma por código do roteiro (docs/direcao-fotografica.md › Roteiro).
// O arquivo original fica em src/assets/photos/<código>.jpg (ou .png). Enquanto
// a foto não existir, o site mostra a ilustração daquele lugar.
//
// `alt` é em inglês (o site é em inglês) e descreve a cena, não a intenção.
// `focus` diz para que lado recortar quando a tela tem outra proporção.
// `ratio`, `ideal` e `min` vêm do roteiro: a proporção da foto e o lado maior
// ideal e mínimo, em pixels. O `npm run fotos` usa os três ao preparar o arquivo.

export type PhotoId = "H1" | "H1m" | "H2" | "H2m" | "H3" | "H3m" | "I1" | "I2" | "I3" | "I4" | "R1" | "B1" | "B2" | "B3" | "L1";

export type Focus = "center" | "left" | "right" | "top" | "bottom";

/** Largura e altura relativas, ex.: [16, 9]. */
export type Ratio = readonly [number, number];

export interface PhotoSlot {
  alt: string;
  focus: Focus;
  /** Versão vertical para o celular (direção de arte), quando existir. */
  mobile?: PhotoId;
  ratio: Ratio;
  /** Lado maior, em pixels: o ideal e o mínimo do roteiro. */
  ideal: number;
  min: number;
}

// Formatos do roteiro (docs/direcao-fotografica.md › Roteiro).
const WIDE = { ratio: [16, 9], ideal: 3840, min: 2560 } as const; // topo, computador
const TALL = { ratio: [9, 16], ideal: 3840, min: 2560 } as const; // topo, celular
const SCENE = { ratio: [3, 2], ideal: 3600, min: 2400 } as const; // L'Heure e a lista
const STILL = { ratio: [4, 5], ideal: 3000, min: 2000 } as const; // regras e Pro Shop

const HERO_GOLDEN = "A clay tennis court seen from a stone terrace at golden hour, framed by umbrella pines, the Mediterranean beyond.";
const HERO_DAY = "The same clay court and umbrella pines in the bright light of a Riviera morning.";
const HERO_NIGHT = "The club terrace at blue hour, the court in shadow and a single lantern lit on the balustrade.";

export const PHOTOS: Record<PhotoId, PhotoSlot> = {
  H1: { alt: HERO_GOLDEN, focus: "center", mobile: "H1m", ...WIDE },
  H1m: { alt: HERO_GOLDEN, focus: "center", ...TALL },
  H2: { alt: HERO_DAY, focus: "center", mobile: "H2m", ...WIDE },
  H2m: { alt: HERO_DAY, focus: "center", ...TALL },
  H3: { alt: HERO_NIGHT, focus: "center", mobile: "H3m", ...WIDE },
  H3m: { alt: HERO_NIGHT, focus: "center", ...TALL },
  I1: { alt: "An empty wicker armchair on a villa terrace high above the sea, late in the afternoon.", focus: "right", ...SCENE },
  I2: { alt: "A clay court falling into the shade of umbrella pines while a player in whites walks along the baseline.", focus: "center", ...SCENE },
  I3: { alt: "A hand pouring tea into a gold-rimmed cup on a linen-covered terrace table, wooden rackets beside it.", focus: "left", ...SCENE },
  I4: { alt: "Two friends at a stone balustrade just after sunset, a cable-knit sweater over his shoulders, looking at the sea.", focus: "center", ...SCENE },
  R1: { alt: "Folded tennis whites, a wooden racket and a striped towel on a teak bench in dappled shade.", focus: "center", ...STILL },
  B1: { alt: "The club emblem embroidered in navy and gold thread on a cream cable-knit sweater.", focus: "center", ...STILL },
  B2: { alt: "The collar and mother-of-pearl buttons of a white linen shirt against a sunlit stone wall.", focus: "center", ...STILL },
  B3: { alt: "A navy cap with a stitched brim resting on a limestone ledge in late sun.", focus: "center", ...STILL },
  L1: { alt: "A cream envelope sealed with gold wax beside a lit lantern on a terrace table at blue hour.", focus: "right", ...SCENE },
};

/** Onde fica o assunto em cada foco, de 0 a 1 (o mesmo object-position do Photo.astro). */
const FOCUS_POINT: Record<Focus, readonly [number, number]> = {
  center: [0.5, 0.5],
  left: [0.3, 0.5],
  right: [0.7, 0.5],
  top: [0.5, 0.25],
  bottom: [0.5, 0.75],
};

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * O maior recorte na proporção pedida, puxado para o foco.
 * Até 1% de diferença conta como a mesma proporção (não recorta).
 */
export function cropFor(width: number, height: number, [rw, rh]: Ratio, focus: Focus = "center"): Box {
  const target = rw / rh;
  if (Math.abs(width / height - target) / target <= 0.01) return { left: 0, top: 0, width, height };
  const [fx, fy] = FOCUS_POINT[focus];
  if (width / height > target) {
    const w = Math.round(height * target);
    return { left: Math.round((width - w) * fx), top: 0, width: w, height };
  }
  const h = Math.round(width / target);
  return { left: 0, top: Math.round((height - h) * fy), width, height: h };
}

const CODE = /(?:^|[^a-z0-9])(h[1-3]m?|i[1-4]|r1|b[1-3]|l1)(?![a-z0-9])/i;

/** O código do roteiro no nome do arquivo: "Foto - H1m - v02.png" → "H1m". */
export function codeFromName(name: string): PhotoId | null {
  const match = name.replace(/\.[a-z0-9]+$/i, "").match(CODE);
  if (!match) return null;
  const code = match[1];
  return (code[0].toUpperCase() + code.slice(1, 2) + code.slice(2).toLowerCase()) as PhotoId;
}

/** Larguras geradas no build (px). Só entram as menores que a original. */
export const PHOTO_WIDTHS = [480, 720, 1080, 1440, 1920, 2560, 3200, 3840] as const;

/** Qualidade por formato: alta o bastante para não se notar, leve o bastante para o celular. */
export const PHOTO_QUALITY = { avif: 55, webp: 72, jpeg: 78 } as const;
