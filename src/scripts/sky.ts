// Ato 0: aplica a luz da hora real no Cap d'Antibes e mantém o relógio em dia.
// Para ver outra hora (prévia, revisão): /?phase=nuit (aube, matin, midi, heure, crepuscule, nuit).

import { SITE } from "../config.ts";
import { THRESHOLD } from "../content/site.ts";
import { PALETTES, PHASE_LABEL, paletteVars, rivieraTime, sunPlacement, sunState, type Phase, type SunState } from "../lib/sun.ts";

/** Um momento típico de cada fase, para a prévia com ?phase=. */
const SAMPLE: Record<Phase, Pick<SunState, "elevation" | "day">> = {
  aube: { elevation: -3, day: -1.05 },
  matin: { elevation: 14, day: -0.6 },
  midi: { elevation: 45, day: 0.1 },
  heure: { elevation: 3, day: 0.93 },
  crepuscule: { elevation: -3, day: 1.05 },
  nuit: { elevation: -20, day: 1.2 },
};

const root = document.querySelector<HTMLElement>("[data-sky]");
const forced = new URLSearchParams(location.search).get("phase");
const preview = forced && Object.hasOwn(PALETTES, forced) ? (forced as Phase) : null;
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

function update() {
  if (!root) return;
  const now = new Date();
  const real = sunState(now, SITE.place.lat, SITE.place.lon);
  const state: SunState = preview ? { ...SAMPLE[preview], phase: preview } : real;
  const palette = PALETTES[state.phase];

  for (const [name, value] of Object.entries(paletteVars(palette))) root.style.setProperty(name, value);
  const { x, y } = sunPlacement(state);
  root.style.setProperty("--sun-x", String(x));
  root.style.setProperty("--sun-y", String(y));
  const glitter = Math.max(0, 1 - Math.abs(state.elevation - 3) / 14) * 0.75;
  root.style.setProperty("--glitter", glitter.toFixed(2));

  root.dataset.phase = state.phase;
  root.dataset.ink = palette.ink;
  root.classList.toggle("on-dark", palette.ink === "dark");
  document.documentElement.dataset.phase = state.phase;
  themeColor?.setAttribute("content", palette.skyTop);

  const clock = root.querySelector<HTMLElement>("[data-clock]");
  const time = root.querySelector<HTMLTimeElement>("[data-clock-time]");
  const label = root.querySelector<HTMLElement>("[data-clock-phase]");
  if (clock && time && label) {
    time.textContent = rivieraTime(now, SITE.place.timeZone);
    time.dateTime = now.toISOString();
    label.textContent = PHASE_LABEL[state.phase];
    clock.hidden = false;
  }

  const line = root.querySelector<HTMLElement>("[data-phase-line]");
  if (line) {
    const text = THRESHOLD.phaseLines[state.phase];
    line.textContent = text ?? "";
    line.hidden = !text;
  }
}

update();
// Daqui em diante, as mudanças de luz (a cada minuto) passam devagar.
requestAnimationFrame(() => requestAnimationFrame(() => root?.classList.add("is-settled")));
// Acerta no começo de cada minuto, como um relógio de verdade.
window.setTimeout(() => {
  update();
  window.setInterval(update, 60_000);
}, 60_000 - (Date.now() % 60_000));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") update();
});
