// O relógio de sol do site: a posição real do sol no Cap d'Antibes decide a
// luz da página. Cálculo astronômico simplificado (precisão de ~0,1°), feito
// no navegador, sem serviço externo.

export type Phase = "aube" | "matin" | "midi" | "heure" | "crepuscule" | "nuit";

export const PHASE_LABEL: Record<Phase, string> = {
  aube: "Aube",
  matin: "Matin",
  midi: "Midi",
  heure: "L’Heure",
  crepuscule: "Crépuscule",
  nuit: "Nuit",
};

export interface SunState {
  /** Altura do sol sobre o horizonte, em graus. */
  elevation: number;
  /** Posição no dia: -1 no nascer, 0 ao meio-dia solar, 1 no pôr do sol. */
  day: number;
  phase: Phase;
}

const RAD = Math.PI / 180;
const wrap = (deg: number) => ((deg % 360) + 360) % 360;

export function sunState(date: Date, lat: number, lon: number): SunState {
  const n = date.getTime() / 86_400_000 + 2_440_587.5 - 2_451_545.0; // dias desde J2000
  const meanLongitude = wrap(280.46 + 0.9856474 * n);
  const meanAnomaly = wrap(357.528 + 0.9856003 * n) * RAD;
  const eclipticLongitude =
    (meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * RAD;
  const obliquity = (23.439 - 0.0000004 * n) * RAD;

  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude));
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));

  const siderealDeg = wrap((18.697374558 + 24.06570982441908 * n) * 15 + lon);
  let hourAngle = wrap(siderealDeg - rightAscension / RAD);
  if (hourAngle > 180) hourAngle -= 360; // negativo = manhã

  const phi = lat * RAD;
  const elevation =
    Math.asin(
      Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle * RAD),
    ) / RAD;

  // Ângulo horário do pôr do sol, para saber em que ponto do dia estamos.
  const cosSunset = -Math.tan(phi) * Math.tan(declination);
  const sunsetAngle = Math.acos(Math.min(1, Math.max(-1, cosSunset))) / RAD || 90;
  const day = Math.max(-1.2, Math.min(1.2, hourAngle / sunsetAngle));

  return { elevation, day, phase: phaseOf(elevation, hourAngle) };
}

function phaseOf(elevation: number, hourAngle: number): Phase {
  if (elevation < -6) return "nuit";
  if (elevation < 0) return hourAngle < 0 ? "aube" : "crepuscule";
  if (hourAngle < -15) return "matin"; // mais de 1 h antes do meio-dia solar
  if (hourAngle > 0 && elevation < 6) return "heure"; // a hora dourada
  return "midi";
}

/** Hora local da Côte d'Azur, "18:42". */
export function rivieraTime(date: Date, timeZone = "Europe/Paris"): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
}

// ---------- Paletas do céu ----------

export interface Palette {
  skyTop: string;
  skyLow: string;
  glow: string;
  glowOpacity: number;
  sea: string;
  coast: string;
  ground: string;
  sun: string;
  /** Opacidade das linhas da quadra (apagam à noite). */
  lines: number;
  /** A luz do terraço. */
  lamp: number;
  stars: number;
  /** Céu claro pede texto azul-marinho; céu escuro, texto creme. */
  ink: "light" | "dark";
}

export const PALETTES: Record<Phase, Palette> = {
  aube: {
    skyTop: "#1c2740", skyLow: "#4b4660", glow: "#d39a86", glowOpacity: 0.4, sea: "#2a3d5c", coast: "#1a2338",
    ground: "#18221f", sun: "#d8a26a", lines: 0.55, lamp: 0.35, stars: 0.35, ink: "dark",
  },
  matin: {
    skyTop: "#d6ddda", skyLow: "#f2e7d0", glow: "#f0d49c", glowOpacity: 0.55, sea: "#6d8798", coast: "#8f9a95",
    ground: "#26342f", sun: "#e2bf73", lines: 0.95, lamp: 0, stars: 0, ink: "light",
  },
  midi: {
    skyTop: "#cfd8da", skyLow: "#f4efe6", glow: "#fff1cf", glowOpacity: 0.35, sea: "#57788d", coast: "#98a39d",
    ground: "#2a3a35", sun: "#e8cf8a", lines: 0.95, lamp: 0, stars: 0, ink: "light",
  },
  heure: {
    skyTop: "#1f2a44", skyLow: "#2e3550", glow: "#c98b56", glowOpacity: 0.42, sea: "#24395a", coast: "#18223a",
    ground: "#1b2726", sun: "#b89b5e", lines: 0.9, lamp: 0, stars: 0, ink: "dark",
  },
  crepuscule: {
    skyTop: "#151d31", skyLow: "#2c2c47", glow: "#a65d6a", glowOpacity: 0.34, sea: "#1c2c47", coast: "#121a2c",
    ground: "#141e1e", sun: "#b89b5e", lines: 0.55, lamp: 0.7, stars: 0.35, ink: "dark",
  },
  nuit: {
    skyTop: "#0b1120", skyLow: "#152036", glow: "#24395a", glowOpacity: 0.25, sea: "#111c31", coast: "#0b1221",
    ground: "#0d1413", sun: "#b89b5e", lines: 0.22, lamp: 1, stars: 1, ink: "dark",
  },
};

function mixColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) => {
    const ca = (pa >> shift) & 255;
    const cb = (pb >> shift) & 255;
    return Math.round(ca + (cb - ca) * t);
  };
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, "0")}`;
}

/** Mistura duas paletas (t de 0 a 1). Usada na rolagem do ato I. */
export function mixPalette(a: Palette, b: Palette, t: number): Palette {
  const k = Math.max(0, Math.min(1, t));
  const num = (x: number, y: number) => (k === 1 ? y : x + (y - x) * k);
  return {
    skyTop: mixColor(a.skyTop, b.skyTop, k),
    skyLow: mixColor(a.skyLow, b.skyLow, k),
    glow: mixColor(a.glow, b.glow, k),
    glowOpacity: num(a.glowOpacity, b.glowOpacity),
    sea: mixColor(a.sea, b.sea, k),
    coast: mixColor(a.coast, b.coast, k),
    ground: mixColor(a.ground, b.ground, k),
    sun: mixColor(a.sun, b.sun, k),
    lines: num(a.lines, b.lines),
    lamp: num(a.lamp, b.lamp),
    stars: num(a.stars, b.stars),
    ink: k < 0.5 ? a.ink : b.ink,
  };
}

/** Variáveis CSS de uma paleta, para aplicar com style.setProperty. */
export function paletteVars(p: Palette): Record<string, string> {
  return {
    "--sky-top": p.skyTop,
    "--sky-low": p.skyLow,
    "--glow": p.glow,
    "--glow-opacity": String(round(p.glowOpacity)),
    "--sea": p.sea,
    "--coast": p.coast,
    "--ground": p.ground,
    "--sun": p.sun,
    "--court-lines": String(round(p.lines)),
    "--lamp": String(round(p.lamp)),
    "--stars": String(round(p.stars)),
  };
}

const round = (x: number) => Math.round(x * 1000) / 1000;

/**
 * Onde o sol fica na ilustração do topo (viewBox 2000 × 500, horizonte em y = 150).
 * Ele nasce à esquerda, sobe e se põe no centro, sobre o mar: a imagem da marca.
 */
export function sunPlacement(state: SunState): { x: number; y: number } {
  const d = Math.max(-1, Math.min(1, state.day));
  const x = d >= 0 ? 1000 - 450 * (1 - d) : 550 - 350 * -d;
  const e = Math.max(-10, Math.min(22, state.elevation));
  // Abaixo do horizonte o sol desce depressa, para os raios não aparecerem à noite.
  const y = e >= 0 ? 150 - e * 6 : 150 - e * 13;
  return { x: Math.round(x - 1000), y: Math.round(y - 150) }; // deslocamento a partir da posição desenhada
}
