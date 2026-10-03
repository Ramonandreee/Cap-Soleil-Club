import { describe, expect, it } from "vitest";
import { PALETTES, mixPalette, paletteVars, rivieraTime, sunPlacement, sunState } from "../../src/lib/sun.ts";

const ANTIBES = { lat: 43.5598, lon: 7.1185 };
const at = (iso: string) => sunState(new Date(iso), ANTIBES.lat, ANTIBES.lon);

describe("sunState", () => {
  it("matches the noon elevation at the solstices", () => {
    // Máxima teórica: 90 − 43,56 + 23,44 = 69,9° (junho) e 90 − 43,56 − 23,44 = 23,0° (dezembro).
    expect(at("2026-06-21T11:32:00Z").elevation).toBeCloseTo(69.9, 0);
    expect(at("2026-12-21T11:57:00Z").elevation).toBeCloseTo(23.0, 0);
  });

  it("finds the phases of a summer day on the Riviera", () => {
    expect(at("2026-06-21T02:00:00Z").phase).toBe("nuit");
    expect(at("2026-06-21T03:45:00Z").phase).toBe("aube"); // ~05:45 em Antibes, antes do nascer
    expect(at("2026-06-21T07:00:00Z").phase).toBe("matin");
    expect(at("2026-06-21T13:00:00Z").phase).toBe("midi");
    expect(at("2026-06-21T18:50:00Z").phase).toBe("heure"); // ~20:50, a hora dourada
    expect(at("2026-06-21T19:35:00Z").phase).toBe("crepuscule"); // ~21:35, logo depois do pôr do sol
    expect(at("2026-06-21T21:30:00Z").phase).toBe("nuit");
  });

  it("finds the golden hour in winter too", () => {
    expect(at("2026-12-21T15:30:00Z").phase).toBe("heure"); // ~16:30, pôr do sol por volta de 16:58
  });

  it("places the day between sunrise (-1) and sunset (1)", () => {
    expect(at("2026-06-21T11:32:00Z").day).toBeCloseTo(0, 1);
    expect(at("2026-06-21T19:20:00Z").day).toBeCloseTo(1, 1);
    expect(at("2026-06-21T03:55:00Z").day).toBeCloseTo(-1, 1);
  });
});

describe("sunPlacement", () => {
  it("sets the sun in the middle of the drawing, on the horizon", () => {
    expect(sunPlacement({ elevation: 0, day: 1, phase: "heure" })).toEqual({ x: 0, y: 0 });
    expect(sunPlacement({ elevation: 30, day: 0, phase: "midi" }).y).toBe(-132);
    expect(sunPlacement({ elevation: -20, day: -1, phase: "nuit" })).toEqual({ x: -800, y: 130 });
  });
});

describe("palettes", () => {
  it("mixes colours and numbers", () => {
    const half = mixPalette(PALETTES.heure, PALETTES.nuit, 0.5);
    expect(half.skyTop).toMatch(/^#[0-9a-f]{6}$/);
    expect(half.stars).toBeCloseTo(0.5);
    expect(mixPalette(PALETTES.heure, PALETTES.nuit, 0)).toEqual(PALETTES.heure);
    expect(mixPalette(PALETTES.heure, PALETTES.nuit, 1)).toEqual(PALETTES.nuit);
  });

  it("exposes every value as a CSS variable", () => {
    const vars = paletteVars(PALETTES.midi);
    expect(Object.keys(vars)).toHaveLength(11);
    expect(vars["--sky-top"]).toBe("#cfd8da");
  });
});

describe("rivieraTime", () => {
  it("shows the time on the Côte d'Azur, summer and winter", () => {
    expect(rivieraTime(new Date("2026-06-21T18:42:00Z"))).toBe("20:42");
    expect(rivieraTime(new Date("2026-12-21T18:42:00Z"))).toBe("19:42");
  });
});
