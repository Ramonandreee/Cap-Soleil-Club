// As fotos do site, uma por código do roteiro (docs/direcao-fotografica.md › Roteiro).
// O arquivo original fica em src/assets/photos/<código>.jpg (ou .png). Enquanto
// a foto não existir, o site mostra a ilustração daquele lugar.
//
// `alt` é em inglês (o site é em inglês) e descreve a cena, não a intenção.
// `focus` diz para que lado recortar quando a tela tem outra proporção.

export type PhotoId = "H1" | "H1m" | "H2" | "H2m" | "H3" | "H3m" | "I1" | "I2" | "I3" | "I4" | "R1" | "B1" | "B2" | "B3" | "L1";

export type Focus = "center" | "left" | "right" | "top" | "bottom";

export interface PhotoSlot {
  alt: string;
  focus: Focus;
  /** Versão vertical para o celular (direção de arte), quando existir. */
  mobile?: PhotoId;
}

export const PHOTOS: Record<PhotoId, PhotoSlot> = {
  H1: {
    alt: "A clay tennis court seen from a stone terrace at golden hour, framed by umbrella pines, the Mediterranean beyond.",
    focus: "center",
    mobile: "H1m",
  },
  H1m: { alt: "A clay tennis court seen from a stone terrace at golden hour, framed by umbrella pines, the Mediterranean beyond.", focus: "center" },
  H2: {
    alt: "The same clay court and umbrella pines in the bright light of a Riviera morning.",
    focus: "center",
    mobile: "H2m",
  },
  H2m: { alt: "The same clay court and umbrella pines in the bright light of a Riviera morning.", focus: "center" },
  H3: {
    alt: "The club terrace at blue hour, the court in shadow and a single lantern lit on the balustrade.",
    focus: "center",
    mobile: "H3m",
  },
  H3m: { alt: "The club terrace at blue hour, the court in shadow and a single lantern lit on the balustrade.", focus: "center" },
  I1: { alt: "An empty wicker armchair on a villa terrace high above the sea, late in the afternoon.", focus: "right" },
  I2: { alt: "A clay court falling into the shade of umbrella pines while a player in whites walks along the baseline.", focus: "center" },
  I3: { alt: "A hand pouring tea into a gold-rimmed cup on a linen-covered terrace table, wooden rackets beside it.", focus: "left" },
  I4: { alt: "Two friends at a stone balustrade just after sunset, a cable-knit sweater over his shoulders, looking at the sea.", focus: "center" },
  R1: { alt: "Folded tennis whites, a wooden racket and a striped towel on a teak bench in dappled shade.", focus: "center" },
  B1: { alt: "The club emblem embroidered in navy and gold thread on a cream cable-knit sweater.", focus: "center" },
  B2: { alt: "The collar and mother-of-pearl buttons of a white linen shirt against a sunlit stone wall.", focus: "center" },
  B3: { alt: "A navy cap with a stitched brim resting on a limestone ledge in late sun.", focus: "center" },
  L1: { alt: "A cream envelope sealed with gold wax beside a lit lantern on a terrace table at blue hour.", focus: "right" },
};

/** Larguras geradas no build (px). Só entram as menores que a original. */
export const PHOTO_WIDTHS = [480, 720, 1080, 1440, 1920, 2560, 3200, 3840] as const;

/** Qualidade por formato: alta o bastante para não se notar, leve o bastante para o celular. */
export const PHOTO_QUALITY = { avif: 55, webp: 72, jpeg: 78 } as const;
